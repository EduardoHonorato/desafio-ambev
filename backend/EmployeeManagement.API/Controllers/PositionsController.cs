using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeManagement.Infrastructure.Data;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Application.DTOs;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PositionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PositionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Busca cargos com paginação e filtros opcionais
        /// </summary>
        /// <param name="departmentId">ID do departamento para filtrar</param>
        /// <param name="page">Número da página</param>
        /// <param name="perPage">Itens por página</param>
        /// <param name="search">Termo de busca (nome, descrição ou nome do departamento)</param>
        /// <returns>Lista paginada de cargos</returns>
        /// <response code="200">Retorna lista de cargos</response>
        [HttpGet]
        public async Task<ActionResult<object>> GetPositions(
            [FromQuery] int? departmentId = null,
            [FromQuery] int page = 1, 
            [FromQuery] int perPage = 10, 
            [FromQuery] string? search = null)
        {
            var query = _context.Positions
                .Include(p => p.Department)
                .Include(p => p.Employees)
                .AsQueryable();

            if (departmentId.HasValue)
            {
                query = query.Where(p => p.DepartmentId == departmentId.Value);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search) || 
                                       (p.Description != null && p.Description.Contains(search)) ||
                                       p.Department.Name.Contains(search));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalItems / perPage);
            var positions = await query
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .Select(p => new PositionDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    DepartmentId = p.DepartmentId,
                    DepartmentName = p.Department.Name,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    EmployeeCount = p.Employees.Count(e => e.IsActive)
                })
                .OrderBy(p => p.DepartmentName)
                .ThenBy(p => p.Name)
                .ToListAsync();

            var response = new
            {
                data = positions,
                meta = new
                {
                    page = page,
                    perPage = perPage,
                    qtdItens = totalItems,
                    totalPages = totalPages
                }
            };

            return Ok(response);
        }

        /// <summary>
        /// Busca cargo por ID
        /// </summary>
        /// <param name="id">ID do cargo</param>
        /// <returns>Dados do cargo</returns>
        /// <response code="200">Retorna dados do cargo</response>
        /// <response code="404">Cargo não encontrado</response>
        [HttpGet("{id}")]
        public async Task<ActionResult<PositionDto>> GetPosition(int id)
        {
            var position = await _context.Positions
                .Include(p => p.Department)
                .Include(p => p.Employees)
                .Where(p => p.Id == id)
                .Select(p => new PositionDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    DepartmentId = p.DepartmentId,
                    DepartmentName = p.Department.Name,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    EmployeeCount = p.Employees.Count(e => e.IsActive)
                })
                .FirstOrDefaultAsync();

            if (position == null)
            {
                return NotFound(new { message = "Cargo não encontrado" });
            }

            return Ok(position);
        }

        /// <summary>
        /// Cria um novo cargo
        /// </summary>
        /// <param name="createDto">Dados do cargo a ser criado</param>
        /// <returns>Dados do cargo criado</returns>
        /// <response code="201">Cargo criado com sucesso</response>
        /// <response code="400">Erro de validação, departamento não encontrado ou nome duplicado</response>
        [HttpPost]
        public async Task<ActionResult<PositionDto>> CreatePosition(CreatePositionRequest createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var department = await _context.Departments.FindAsync(createDto.DepartmentId);
            if (department == null)
            {
                return BadRequest(new { message = "Departamento não encontrado" });
            }

            var existingPosition = await _context.Positions
                .FirstOrDefaultAsync(p => p.Name.ToLower() == createDto.Name.ToLower() 
                                         && p.DepartmentId == createDto.DepartmentId);

            if (existingPosition != null)
            {
                return BadRequest(new { message = "Já existe um cargo com este nome neste departamento" });
            }

            var position = new Position
            {
                Name = createDto.Name,
                Description = createDto.Description,
                DepartmentId = createDto.DepartmentId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Positions.Add(position);
            await _context.SaveChangesAsync();

            var positionDto = new PositionDto
            {
                Id = position.Id,
                Name = position.Name,
                Description = position.Description,
                DepartmentId = position.DepartmentId,
                DepartmentName = department.Name,
                IsActive = position.IsActive,
                CreatedAt = position.CreatedAt,
                UpdatedAt = position.UpdatedAt,
                EmployeeCount = 0
            };

            return CreatedAtAction(nameof(GetPosition), new { id = position.Id }, positionDto);
        }

        /// <summary>
        /// Atualiza um cargo existente
        /// </summary>
        /// <param name="id">ID do cargo a ser atualizado</param>
        /// <param name="updateDto">Dados atualizados do cargo</param>
        /// <returns>Sem conteúdo</returns>
        /// <response code="204">Cargo atualizado com sucesso</response>
        /// <response code="400">Erro de validação, departamento não encontrado ou nome duplicado</response>
        /// <response code="404">Cargo não encontrado</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePosition(int id, UpdatePositionRequest updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var position = await _context.Positions.FindAsync(id);
            if (position == null)
            {
                return NotFound(new { message = "Cargo não encontrado" });
            }

            var department = await _context.Departments.FindAsync(updateDto.DepartmentId);
            if (department == null)
            {
                return BadRequest(new { message = "Departamento não encontrado" });
            }

            var existingPosition = await _context.Positions
                .FirstOrDefaultAsync(p => p.Name.ToLower() == updateDto.Name.ToLower() 
                                         && p.DepartmentId == updateDto.DepartmentId 
                                         && p.Id != id);

            if (existingPosition != null)
            {
                return BadRequest(new { message = "Já existe um cargo com este nome neste departamento" });
            }

            position.Name = updateDto.Name;
            position.Description = updateDto.Description;
            position.DepartmentId = updateDto.DepartmentId;
            position.IsActive = updateDto.IsActive;
            position.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PositionExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Exclui um cargo
        /// </summary>
        /// <param name="id">ID do cargo a ser excluído</param>
        /// <returns>Sem conteúdo</returns>
        /// <response code="204">Cargo excluído com sucesso</response>
        /// <response code="400">Não é possível excluir, há funcionários associados</response>
        /// <response code="404">Cargo não encontrado</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePosition(int id)
        {
            var position = await _context.Positions
                .Include(p => p.Employees)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (position == null)
            {
                return NotFound(new { message = "Cargo não encontrado" });
            }

            if (position.Employees.Any(e => e.IsActive))
            {
                return BadRequest(new { message = "Não é possível excluir o cargo pois há funcionários associados" });
            }

            _context.Positions.Remove(position);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PositionExists(int id)
        {
            return _context.Positions.Any(e => e.Id == id);
        }
    }
}
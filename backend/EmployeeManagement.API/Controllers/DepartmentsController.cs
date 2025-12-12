using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeManagement.Infrastructure.Data;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Application.DTOs;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DepartmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Busca departamentos com paginação e filtro opcional
        /// </summary>
        /// <param name="page">Número da página</param>
        /// <param name="perPage">Itens por página</param>
        /// <param name="search">Termo de busca (nome ou descrição)</param>
        /// <returns>Lista paginada de departamentos</returns>
        /// <response code="200">Retorna lista de departamentos</response>
        [HttpGet]
        public async Task<ActionResult<object>> GetDepartments(
            [FromQuery] int page = 1, 
            [FromQuery] int perPage = 10, 
            [FromQuery] string? search = null)
        {
            var query = _context.Departments.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(d => d.Name.Contains(search) || 
                                       (d.Description != null && d.Description.Contains(search)));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalItems / perPage);
            var departments = await query
                .Include(d => d.Employees)
                .Include(d => d.Positions)
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
                    IsActive = d.IsActive,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt,
                    EmployeeCount = d.Employees.Count(e => e.IsActive),
                    PositionCount = d.Positions.Count(p => p.IsActive)
                })
                .OrderBy(d => d.Name)
                .ToListAsync();

            var response = new
            {
                data = departments,
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
        /// Busca departamento por ID
        /// </summary>
        /// <param name="id">ID do departamento</param>
        /// <returns>Dados do departamento</returns>
        /// <response code="200">Retorna dados do departamento</response>
        /// <response code="404">Departamento não encontrado</response>
        [HttpGet("{id}")]
        public async Task<ActionResult<DepartmentDto>> GetDepartment(int id)
        {
            var department = await _context.Departments
                .Include(d => d.Employees)
                .Include(d => d.Positions)
                .Where(d => d.Id == id)
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
                    IsActive = d.IsActive,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt,
                    EmployeeCount = d.Employees.Count(e => e.IsActive),
                    PositionCount = d.Positions.Count(p => p.IsActive)
                })
                .FirstOrDefaultAsync();

            if (department == null)
            {
                return NotFound(new { message = "Departamento não encontrado" });
            }

            return Ok(department);
        }

        /// <summary>
        /// Cria um novo departamento
        /// </summary>
        /// <param name="createDto">Dados do departamento a ser criado</param>
        /// <returns>Dados do departamento criado</returns>
        /// <response code="201">Departamento criado com sucesso</response>
        /// <response code="400">Erro de validação ou nome duplicado</response>
        [HttpPost]
        public async Task<ActionResult<DepartmentDto>> CreateDepartment(CreateDepartmentRequest createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingDepartment = await _context.Departments
                .FirstOrDefaultAsync(d => d.Name.ToLower() == createDto.Name.ToLower());

            if (existingDepartment != null)
            {
                return BadRequest(new { message = "Já existe um departamento com este nome" });
            }

            var department = new Department
            {
                Name = createDto.Name,
                Description = createDto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            var departmentDto = new DepartmentDto
            {
                Id = department.Id,
                Name = department.Name,
                Description = department.Description,
                IsActive = department.IsActive,
                CreatedAt = department.CreatedAt,
                UpdatedAt = department.UpdatedAt,
                EmployeeCount = 0,
                PositionCount = 0
            };

            return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, departmentDto);
        }

        /// <summary>
        /// Atualiza um departamento existente
        /// </summary>
        /// <param name="id">ID do departamento a ser atualizado</param>
        /// <param name="updateDto">Dados atualizados do departamento</param>
        /// <returns>Sem conteúdo</returns>
        /// <response code="204">Departamento atualizado com sucesso</response>
        /// <response code="400">Erro de validação ou nome duplicado</response>
        /// <response code="404">Departamento não encontrado</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(int id, UpdateDepartmentRequest updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound(new { message = "Departamento não encontrado" });
            }

            var existingDepartment = await _context.Departments
                .FirstOrDefaultAsync(d => d.Name.ToLower() == updateDto.Name.ToLower() && d.Id != id);

            if (existingDepartment != null)
            {
                return BadRequest(new { message = "Já existe um departamento com este nome" });
            }

            department.Name = updateDto.Name;
            department.Description = updateDto.Description;
            department.IsActive = updateDto.IsActive;
            department.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DepartmentExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Exclui um departamento
        /// </summary>
        /// <param name="id">ID do departamento a ser excluído</param>
        /// <returns>Sem conteúdo</returns>
        /// <response code="204">Departamento excluído com sucesso</response>
        /// <response code="400">Não é possível excluir, há funcionários ou cargos associados</response>
        /// <response code="404">Departamento não encontrado</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _context.Departments
                .Include(d => d.Employees)
                .Include(d => d.Positions)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
            {
                return NotFound(new { message = "Departamento não encontrado" });
            }

            if (department.Employees.Any(e => e.IsActive) || department.Positions.Any(p => p.IsActive))
            {
                return BadRequest(new { message = "Não é possível excluir o departamento pois há funcionários ou cargos associados" });
            }

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DepartmentExists(int id)
        {
            return _context.Departments.Any(e => e.Id == id);
        }
    }
}
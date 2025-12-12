using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmployeeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(IEmployeeService employeeService, ILogger<EmployeesController> logger)
    {
        _employeeService = employeeService;
        _logger = logger;
    }

    /// <summary>
    /// Obtém o ID do usuário autenticado a partir do token JWT
    /// </summary>
    /// <returns>ID do usuário autenticado</returns>
    /// <exception cref="UnauthorizedAccessException">Quando usuário não está autenticado</exception>
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Usuário não autenticado");
        }
        return userId;
    }

    /// <summary>
    /// Busca todos os colaboradores com filtro opcional
    /// </summary>
    /// <param name="search">Termo de busca (nome, sobrenome, email ou documento)</param>
    /// <returns>Lista de colaboradores</returns>
    /// <response code="200">Retorna lista de colaboradores</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll([FromQuery] string? search = null)
    {
        try
        {
            var employees = await _employeeService.GetAllAsync(search);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar funcionários");
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    /// <summary>
    /// Busca colaborador por ID
    /// </summary>
    /// <param name="id">ID do colaborador</param>
    /// <returns>Dados do colaborador</returns>
    /// <response code="200">Retorna dados do colaborador</response>
    /// <response code="404">Colaborador não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeDto>> GetById(int id)
    {
        try
        {
            var employee = await _employeeService.GetByIdAsync(id);
            if (employee == null)
            {
                return NotFound(new { message = "Funcionário não encontrado" });
            }
            return Ok(employee);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar funcionário com ID: {Id}", id);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    /// <summary>
    /// Cria um novo colaborador
    /// </summary>
    /// <param name="request">Dados do colaborador a ser criado</param>
    /// <returns>Dados do colaborador criado</returns>
    /// <response code="201">Colaborador criado com sucesso</response>
    /// <response code="400">Erro de validação</response>
    /// <response code="403">Usuário não tem permissão para criar colaborador com este cargo</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create([FromBody] CreateEmployeeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUserId = GetCurrentUserId();
            var employee = await _employeeService.CreateAsync(request, currentUserId);
            _logger.LogInformation("Funcionário criado com sucesso. ID: {Id}, Email: {Email}", employee.Id, employee.Email);
            return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Erro de validação ao criar funcionário: {Error}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Acesso não autorizado ao criar funcionário: {Error}", ex.Message);
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar funcionário");
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    /// <summary>
    /// Atualiza um colaborador existente
    /// </summary>
    /// <param name="id">ID do colaborador a ser atualizado</param>
    /// <param name="request">Dados atualizados do colaborador</param>
    /// <returns>Dados do colaborador atualizado</returns>
    /// <response code="200">Colaborador atualizado com sucesso</response>
    /// <response code="400">Erro de validação</response>
    /// <response code="403">Usuário não tem permissão para editar colaborador com este cargo</response>
    /// <response code="404">Colaborador não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPut("{id}")]
    public async Task<ActionResult<EmployeeDto>> Update(int id, [FromBody] UpdateEmployeeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUserId = GetCurrentUserId();
            var employee = await _employeeService.UpdateAsync(id, request, currentUserId);
            _logger.LogInformation("Funcionário atualizado com sucesso. ID: {Id}", id);
            return Ok(employee);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Funcionário não encontrado para atualização. ID: {Id}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Erro de validação ao atualizar funcionário: {Error}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Acesso não autorizado ao atualizar funcionário: {Error}", ex.Message);
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar funcionário. ID: {Id}", id);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    /// <summary>
    /// Atualiza dados do perfil do usuário autenticado
    /// </summary>
    /// <param name="request">Dados atualizados do perfil (apenas dados pessoais)</param>
    /// <returns>Dados do colaborador atualizado</returns>
    /// <response code="200">Perfil atualizado com sucesso</response>
    /// <response code="400">Erro de validação</response>
    /// <response code="404">Usuário não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPut("profile")]
    public async Task<ActionResult<EmployeeDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUserId = GetCurrentUserId();
            var employee = await _employeeService.UpdateProfileAsync(currentUserId, request);
            _logger.LogInformation("Perfil atualizado com sucesso. ID: {Id}", currentUserId);
            return Ok(employee);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Usuário não encontrado para atualização de perfil. ID: {Id}", GetCurrentUserId());
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Erro de validação ao atualizar perfil: {Error}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar perfil. ID: {Id}", GetCurrentUserId());
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    /// <summary>
    /// Exclui um colaborador
    /// </summary>
    /// <param name="id">ID do colaborador a ser excluído</param>
    /// <returns>Sem conteúdo</returns>
    /// <response code="204">Colaborador excluído com sucesso</response>
    /// <response code="403">Usuário não tem permissão para excluir colaborador com este cargo</response>
    /// <response code="404">Colaborador não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            await _employeeService.DeleteAsync(id, currentUserId);
            _logger.LogInformation("Funcionário excluído com sucesso. ID: {Id}", id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Funcionário não encontrado para exclusão. ID: {Id}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Acesso não autorizado ao excluir funcionário: {Error}", ex.Message);
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao excluir funcionário. ID: {Id}", id);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }
}

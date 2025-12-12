using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Realiza login do colaborador e envia código OTP por email
    /// </summary>
    /// <param name="request">Email e senha do colaborador</param>
    /// <returns>Resposta indicando que OTP foi enviado</returns>
    /// <response code="200">Código OTP enviado com sucesso</response>
    /// <response code="401">Email ou senha inválidos</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            _logger.LogInformation("Tentativa de login para email: {Email}", request.Email);
            var response = await _authService.LoginAsync(request);
            _logger.LogInformation("Código OTP enviado para email: {Email}", request.Email);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Falha no login para email: {Email}. Erro: {Error}", request.Email, ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao processar login para email: {Email}", request.Email);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    /// <summary>
    /// Verifica código OTP e retorna token JWT
    /// </summary>
    /// <param name="request">Email e código OTP</param>
    /// <returns>Resposta com token JWT e dados do colaborador</returns>
    /// <response code="200">OTP verificado com sucesso, token retornado</response>
    /// <response code="401">Código OTP inválido ou expirado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPost("verify-otp")]
    public async Task<ActionResult<LoginResponse>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        try
        {
            _logger.LogInformation("Tentativa de verificação OTP para email: {Email}", request.Email);
            var response = await _authService.VerifyOtpAsync(request);
            _logger.LogInformation("OTP verificado com sucesso para email: {Email}", request.Email);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Falha na verificação OTP para email: {Email}. Erro: {Error}", request.Email, ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao verificar OTP para email: {Email}", request.Email);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    /// <summary>
    /// Reenvia código OTP para o email do colaborador
    /// </summary>
    /// <param name="request">Email do colaborador</param>
    /// <returns>Mensagem de sucesso</returns>
    /// <response code="200">Código OTP reenviado com sucesso</response>
    /// <response code="401">Email não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPost("resend-otp")]
    public async Task<IActionResult> ResendOtp([FromBody] ResendOtpRequest request)
    {
        try
        {
            _logger.LogInformation("Solicitação de reenvio de OTP para email: {Email}", request.Email);
            await _authService.ResendOtpAsync(request.Email);
            _logger.LogInformation("OTP reenviado com sucesso para email: {Email}", request.Email);
            return Ok(new { message = "Código de verificação reenviado com sucesso" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Falha ao reenviar OTP para email: {Email}. Erro: {Error}", request.Email, ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao reenviar OTP para email: {Email}", request.Email);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }
}

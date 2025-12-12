using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Domain.Interfaces;

namespace EmployeeManagement.Application.Services;

public class AuthService : IAuthService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailService _emailService;
    private readonly IOtpCodeRepository _otpRepository;

    public AuthService(
        IEmployeeRepository employeeRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IEmailService emailService,
        IOtpCodeRepository otpRepository)
    {
        _employeeRepository = employeeRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _emailService = emailService;
        _otpRepository = otpRepository;
    }

    /// <summary>
    /// Realiza login do colaborador e envia código OTP por email
    /// </summary>
    /// <param name="request">Email e senha do colaborador</param>
    /// <returns>Resposta indicando que OTP foi enviado</returns>
    /// <exception cref="UnauthorizedAccessException">Quando email ou senha são inválidos</exception>
    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var employee = await _employeeRepository.GetByEmailAsync(request.Email);
        if (employee == null || !_passwordHasher.VerifyPassword(request.Password, employee.PasswordHash))
        {
            throw new UnauthorizedAccessException("Email ou senha inválidos");
        }

        var random = new Random();
        var otpCode = random.Next(100000, 999999).ToString();

        await _otpRepository.InvalidateOldOtpsAsync(employee.Id);

        var otp = new OtpCode
        {
            EmployeeId = employee.Id,
            Code = otpCode,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        await _otpRepository.AddAsync(otp);
        await _emailService.SendOtpEmailAsync(employee.Email, otpCode, employee.FirstName, employee.LastName);

        return new LoginResponse
        {
            RequiresOtp = true,
            Message = "Código de verificação enviado para seu email"
        };
    }

    /// <summary>
    /// Verifica código OTP e retorna token JWT
    /// </summary>
    /// <param name="request">Email e código OTP</param>
    /// <returns>Resposta com token JWT e dados do colaborador</returns>
    /// <exception cref="UnauthorizedAccessException">Quando código é inválido ou expirado</exception>
    public async Task<LoginResponse> VerifyOtpAsync(VerifyOtpRequest request)
    {
        var employee = await _employeeRepository.GetByEmailAsync(request.Email);
        if (employee == null)
        {
            throw new UnauthorizedAccessException("Email ou código inválido");
        }

        var otp = await _otpRepository.GetValidOtpAsync(employee.Id, request.Code);
        if (otp == null)
        {
            throw new UnauthorizedAccessException("Código inválido ou expirado");
        }

        otp.IsUsed = true;
        await _otpRepository.UpdateAsync(otp);

        var token = _jwtTokenService.GenerateToken(employee);

        return new LoginResponse
        {
            Token = token,
            Employee = MapToDto(employee),
            RequiresOtp = false
        };
    }

    /// <summary>
    /// Reenvia código OTP para o email do colaborador
    /// </summary>
    /// <param name="email">Email do colaborador</param>
    /// <exception cref="UnauthorizedAccessException">Quando email não é encontrado</exception>
    public async Task ResendOtpAsync(string email)
    {
        var employee = await _employeeRepository.GetByEmailAsync(email);
        if (employee == null)
        {
            throw new UnauthorizedAccessException("Email não encontrado");
        }

        var random = new Random();
        var otpCode = random.Next(100000, 999999).ToString();

        await _otpRepository.InvalidateOldOtpsAsync(employee.Id);

        var otp = new OtpCode
        {
            EmployeeId = employee.Id,
            Code = otpCode,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        await _otpRepository.AddAsync(otp);
        await _emailService.SendOtpEmailAsync(employee.Email, otpCode, employee.FirstName, employee.LastName);
    }

    private static EmployeeDto MapToDto(Employee employee)
    {
        return new EmployeeDto
        {
            Id = employee.Id,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Email = employee.Email,
            Document = employee.Document,
            BirthDate = employee.BirthDate,
            Role = employee.Role,
            Department = employee.Department,
            ManagerId = employee.ManagerId,
            ManagerName = employee.Manager != null ? $"{employee.Manager.FirstName} {employee.Manager.LastName}" : null,
            Phones = employee.Phones.Select(p => new PhoneDto
            {
                Id = p.Id,
                Number = p.Number,
                Type = p.Type
            }).ToList(),
            CreatedAt = employee.CreatedAt,
            UpdatedAt = employee.UpdatedAt
        };
    }
}

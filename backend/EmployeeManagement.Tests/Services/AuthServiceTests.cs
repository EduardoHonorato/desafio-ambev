using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Application.Services;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Domain.Interfaces;
using Moq;
using Xunit;

namespace EmployeeManagement.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IEmployeeRepository> _employeeRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtTokenService> _jwtTokenServiceMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly Mock<IOtpCodeRepository> _otpRepositoryMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _employeeRepositoryMock = new Mock<IEmployeeRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtTokenServiceMock = new Mock<IJwtTokenService>();
        _emailServiceMock = new Mock<IEmailService>();
        _otpRepositoryMock = new Mock<IOtpCodeRepository>();
        _authService = new AuthService(
            _employeeRepositoryMock.Object,
            _passwordHasherMock.Object,
            _jwtTokenServiceMock.Object,
            _emailServiceMock.Object,
            _otpRepositoryMock.Object
        );
    }

    [Fact]
    public async Task LoginAsync_ShouldThrowException_WhenEmployeeNotFound()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "password123"
        };

        _employeeRepositoryMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((Employee?)null);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
    }

    [Fact]
    public async Task LoginAsync_ShouldThrowException_WhenPasswordIsInvalid()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "john@example.com",
            Password = "wrongpassword"
        };

        var employee = new Employee
        {
            Id = 1,
            Email = request.Email,
            PasswordHash = "hashed_password"
        };

        _employeeRepositoryMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(employee);
        _passwordHasherMock.Setup(h => h.VerifyPassword(request.Password, employee.PasswordHash)).Returns(false);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
    }

    [Fact]
    public async Task LoginAsync_ShouldRequireOtp_WhenCredentialsAreValid()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "john@example.com",
            Password = "password123"
        };

        var employee = new Employee
        {
            Id = 1,
            Email = request.Email,
            FirstName = "John",
            LastName = "Doe",
            PasswordHash = "hashed_password",
            Role = EmployeeRole.Employee,
            Phones = new List<Phone>()
        };

        _employeeRepositoryMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(employee);
        _passwordHasherMock.Setup(h => h.VerifyPassword(request.Password, employee.PasswordHash)).Returns(true);
        _otpRepositoryMock.Setup(r => r.InvalidateOldOtpsAsync(employee.Id)).Returns(Task.CompletedTask);
        _otpRepositoryMock.Setup(r => r.AddAsync(It.IsAny<OtpCode>())).ReturnsAsync((OtpCode otp) => otp);
        _emailServiceMock.Setup(e => e.SendOtpEmailAsync(employee.Email, It.IsAny<string>(), employee.FirstName, employee.LastName)).Returns(Task.CompletedTask);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.RequiresOtp);
        Assert.Null(result.Token);
        _emailServiceMock.Verify(e => e.SendOtpEmailAsync(employee.Email, It.IsAny<string>(), employee.FirstName, employee.LastName), Times.Once);
    }
}

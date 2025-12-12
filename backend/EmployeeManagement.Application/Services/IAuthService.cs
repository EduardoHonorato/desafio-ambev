using EmployeeManagement.Application.DTOs;

namespace EmployeeManagement.Application.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> VerifyOtpAsync(VerifyOtpRequest request);
    Task ResendOtpAsync(string email);
}

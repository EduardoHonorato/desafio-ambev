namespace EmployeeManagement.Application.DTOs;

public class LoginResponse
{
    public string? Token { get; set; }
    public EmployeeDto? Employee { get; set; }
    public bool RequiresOtp { get; set; }
    public string? Message { get; set; }
}

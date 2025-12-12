namespace EmployeeManagement.Domain.Interfaces;

public interface IEmailService
{
    Task SendOtpEmailAsync(string email, string code, string firstName, string lastName);
}


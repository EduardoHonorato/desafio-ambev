using EmployeeManagement.Domain.Entities;

namespace EmployeeManagement.Domain.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(Employee employee);
}

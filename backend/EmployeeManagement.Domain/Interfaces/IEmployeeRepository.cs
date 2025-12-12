using EmployeeManagement.Domain.Entities;

namespace EmployeeManagement.Domain.Interfaces;

public interface IEmployeeRepository : IRepository<Employee>
{
    Task<Employee?> GetByEmailAsync(string email);
    Task<Employee?> GetByDocumentAsync(string document);
    Task<Employee?> GetByIdWithManagerAsync(int id);
    Task<IEnumerable<Employee>> GetSubordinatesAsync(int managerId);
    Task<bool> CanManageRoleAsync(int employeeId, EmployeeRole targetRole);
    Task<IEnumerable<Employee>> GetAllAsync(string? search = null);
}

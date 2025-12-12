using EmployeeManagement.Application.DTOs;

namespace EmployeeManagement.Application.Services;

public interface IEmployeeService
{
    Task<EmployeeDto> CreateAsync(CreateEmployeeRequest request, int currentUserId);
    Task<EmployeeDto> UpdateAsync(int id, UpdateEmployeeRequest request, int currentUserId);
    Task<EmployeeDto> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task DeleteAsync(int id, int currentUserId);
    Task<EmployeeDto?> GetByIdAsync(int id);
    Task<IEnumerable<EmployeeDto>> GetAllAsync(string? search = null);
    Task<bool> CanManageRoleAsync(int employeeId, int targetRole);
}

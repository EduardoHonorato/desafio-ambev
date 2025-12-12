using EmployeeManagement.Domain.Entities;

namespace EmployeeManagement.Application.DTOs;

public class EmployeeDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Document { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public EmployeeRole Role { get; set; }
    public string Department { get; set; } = string.Empty;
    public int? PositionId { get; set; }
    public int? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public List<PhoneDto> Phones { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

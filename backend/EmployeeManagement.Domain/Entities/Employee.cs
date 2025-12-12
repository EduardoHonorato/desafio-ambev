namespace EmployeeManagement.Domain.Entities;

public class Employee
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Document { get; set; } = string.Empty; // Unique
    public DateTime BirthDate { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public EmployeeRole Role { get; set; }
    public string Department { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public int? PositionId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }
    public List<Employee> Subordinates { get; set; } = new();
    public List<Phone> Phones { get; set; } = new();
    public virtual Department? DepartmentEntity { get; set; }
    public virtual Position? PositionEntity { get; set; }
}

public enum EmployeeRole
{
    Employee = 1,
    Leader = 2,
    Director = 3
}

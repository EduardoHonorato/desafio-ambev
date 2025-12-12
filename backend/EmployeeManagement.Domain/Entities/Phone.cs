namespace EmployeeManagement.Domain.Entities;

public class Phone
{
    public int Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Mobile, Landline, etc.
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
}

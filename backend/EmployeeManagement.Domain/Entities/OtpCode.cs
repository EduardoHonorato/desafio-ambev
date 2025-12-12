namespace EmployeeManagement.Domain.Entities;

public class OtpCode
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation property
    public Employee Employee { get; set; } = null!;
}


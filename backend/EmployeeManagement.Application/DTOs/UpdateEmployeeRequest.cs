using System.ComponentModel.DataAnnotations;
using EmployeeManagement.Domain.Entities;

namespace EmployeeManagement.Application.DTOs;

public class UpdateEmployeeRequest
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [MinLength(2, ErrorMessage = "Nome deve ter no mínimo 2 caracteres")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Sobrenome é obrigatório")]
    [MinLength(2, ErrorMessage = "Sobrenome deve ter no mínimo 2 caracteres")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email é obrigatório")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Documento é obrigatório")]
    public string Document { get; set; } = string.Empty;

    [Required(ErrorMessage = "Data de nascimento é obrigatória")]
    public DateTime BirthDate { get; set; }

    [Required(ErrorMessage = "Cargo é obrigatório")]
    public EmployeeRole Role { get; set; }

    public string Department { get; set; } = string.Empty;
    public int? PositionId { get; set; }
    public int? ManagerId { get; set; }
    
    [Required(ErrorMessage = "Pelo menos um telefone é obrigatório")]
    [MinLength(1, ErrorMessage = "Pelo menos um telefone é obrigatório")]
    public List<CreatePhoneRequest> Phones { get; set; } = new();
    
    public string? Password { get; set; }
    public bool IsActive { get; set; } = true;
}

using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Application.DTOs;

public class PositionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int EmployeeCount { get; set; }
}

public class CreatePositionRequest
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
    public string Name { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "Descrição deve ter no máximo 500 caracteres")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Departamento é obrigatório")]
    public int DepartmentId { get; set; }
}

public class UpdatePositionRequest
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
    public string Name { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "Descrição deve ter no máximo 500 caracteres")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Departamento é obrigatório")]
    public int DepartmentId { get; set; }

    public bool IsActive { get; set; } = true;
}
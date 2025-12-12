using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Application.DTOs;

public class CreatePhoneRequest
{
    [Required(ErrorMessage = "Número do telefone é obrigatório")]
    public string Number { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tipo do telefone é obrigatório")]
    public string Type { get; set; } = string.Empty;
}

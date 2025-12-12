using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Domain.Interfaces;

namespace EmployeeManagement.Application.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IPasswordHasher _passwordHasher;

    public EmployeeService(IEmployeeRepository employeeRepository, IPasswordHasher passwordHasher)
    {
        _employeeRepository = employeeRepository;
        _passwordHasher = passwordHasher;
    }

    /// <summary>
    /// Cria um novo colaborador
    /// </summary>
    /// <param name="request">Dados do colaborador a ser criado</param>
    /// <param name="currentUserId">ID do usuário atual realizando a operação</param>
    /// <returns>DTO do colaborador criado</returns>
    /// <exception cref="ArgumentException">Quando validações falham (idade, documento, email duplicado)</exception>
    /// <exception cref="UnauthorizedAccessException">Quando usuário não tem permissão para criar colaborador com o cargo especificado</exception>
    public async Task<EmployeeDto> CreateAsync(CreateEmployeeRequest request, int currentUserId)
    {
        var age = DateTime.Now.Year - request.BirthDate.Year;
        if (request.BirthDate.Date > DateTime.Now.AddYears(-age)) age--;
        if (age < 18)
        {
            throw new ArgumentException("Funcionário deve ter no mínimo 18 anos");
        }

        if (await _employeeRepository.ExistsAsync(e => e.Document == request.Document))
        {
            throw new ArgumentException("Documento já cadastrado");
        }

        if (await _employeeRepository.ExistsAsync(e => e.Email == request.Email))
        {
            throw new ArgumentException("Email já cadastrado");
        }

        var currentUser = await _employeeRepository.GetByIdAsync(currentUserId);
        if (currentUser == null)
        {
            throw new UnauthorizedAccessException("Usuário não encontrado");
        }

        if (!await _employeeRepository.CanManageRoleAsync(currentUserId, request.Role))
        {
            throw new UnauthorizedAccessException("Você não tem permissão para criar funcionários com este cargo");
        }

        if (request.ManagerId.HasValue)
        {
            var manager = await _employeeRepository.GetByIdAsync(request.ManagerId.Value);
            if (manager == null)
            {
                throw new ArgumentException("Gerente não encontrado");
            }
        }

        var employee = new Employee
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Document = request.Document,
            BirthDate = request.BirthDate,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Role = request.Role,
            Department = request.Department,
            ManagerId = request.ManagerId,
            CreatedAt = DateTime.UtcNow,
            Phones = request.Phones.Select(p => new Phone
            {
                Number = p.Number,
                Type = p.Type
            }).ToList()
        };

        var created = await _employeeRepository.AddAsync(employee);
        return MapToDto(created);
    }

    /// <summary>
    /// Atualiza um colaborador existente
    /// </summary>
    /// <param name="id">ID do colaborador a ser atualizado</param>
    /// <param name="request">Dados atualizados do colaborador</param>
    /// <param name="currentUserId">ID do usuário atual realizando a operação</param>
    /// <returns>DTO do colaborador atualizado</returns>
    /// <exception cref="KeyNotFoundException">Quando colaborador não é encontrado</exception>
    /// <exception cref="ArgumentException">Quando validações falham</exception>
    /// <exception cref="UnauthorizedAccessException">Quando usuário não tem permissão</exception>
    public async Task<EmployeeDto> UpdateAsync(int id, UpdateEmployeeRequest request, int currentUserId)
    {
        var employee = await _employeeRepository.GetByIdWithManagerAsync(id);
        if (employee == null)
        {
            throw new KeyNotFoundException("Funcionário não encontrado");
        }

        var age = DateTime.Now.Year - request.BirthDate.Year;
        if (request.BirthDate.Date > DateTime.Now.AddYears(-age)) age--;
        if (age < 18)
        {
            throw new ArgumentException("Funcionário deve ter no mínimo 18 anos");
        }

        if (await _employeeRepository.ExistsAsync(e => e.Email == request.Email && e.Id != id))
        {
            throw new ArgumentException("Email já cadastrado");
        }

        if (await _employeeRepository.ExistsAsync(e => e.Document == request.Document && e.Id != id))
        {
            throw new ArgumentException("Documento já cadastrado");
        }

        if (!await _employeeRepository.CanManageRoleAsync(currentUserId, request.Role))
        {
            throw new UnauthorizedAccessException("Você não tem permissão para editar funcionários com este cargo");
        }

        if (request.ManagerId.HasValue)
        {
            var manager = await _employeeRepository.GetByIdAsync(request.ManagerId.Value);
            if (manager == null)
            {
                throw new ArgumentException("Gerente não encontrado");
            }
        }

        employee.FirstName = request.FirstName;
        employee.LastName = request.LastName;
        employee.Email = request.Email;
        employee.Document = request.Document;
        employee.BirthDate = request.BirthDate;
        employee.Role = request.Role;
        employee.Department = request.Department;
        employee.PositionId = request.PositionId;
        employee.ManagerId = request.ManagerId;
        employee.IsActive = request.IsActive;
        employee.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(request.Password))
        {
            employee.PasswordHash = _passwordHasher.HashPassword(request.Password);
        }

        employee.Phones.Clear();
        foreach (var phoneRequest in request.Phones)
        {
            employee.Phones.Add(new Phone
            {
                Number = phoneRequest.Number,
                Type = phoneRequest.Type,
                EmployeeId = employee.Id
            });
        }

        await _employeeRepository.UpdateAsync(employee);
        return MapToDto(employee);
    }

    /// <summary>
    /// Atualiza dados do perfil do usuário autenticado
    /// </summary>
    /// <param name="userId">ID do usuário autenticado</param>
    /// <param name="request">Dados atualizados do perfil (apenas dados pessoais)</param>
    /// <returns>DTO do colaborador atualizado</returns>
    /// <exception cref="KeyNotFoundException">Quando usuário não é encontrado</exception>
    /// <exception cref="ArgumentException">Quando validações falham</exception>
    public async Task<EmployeeDto> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var employee = await _employeeRepository.GetByIdAsync(userId);
        if (employee == null)
        {
            throw new KeyNotFoundException("Usuário não encontrado");
        }

        var age = DateTime.Now.Year - request.BirthDate.Year;
        if (request.BirthDate.Date > DateTime.Now.AddYears(-age)) age--;
        if (age < 18)
        {
            throw new ArgumentException("Funcionário deve ter no mínimo 18 anos");
        }

        if (await _employeeRepository.ExistsAsync(e => e.Email == request.Email && e.Id != userId))
        {
            throw new ArgumentException("Email já cadastrado");
        }

        if (await _employeeRepository.ExistsAsync(e => e.Document == request.Document && e.Id != userId))
        {
            throw new ArgumentException("Documento já cadastrado");
        }

        employee.FirstName = request.FirstName;
        employee.LastName = request.LastName;
        employee.Email = request.Email;
        employee.Document = request.Document;
        employee.BirthDate = request.BirthDate;
        employee.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(request.Password))
        {
            employee.PasswordHash = _passwordHasher.HashPassword(request.Password);
        }

        employee.Phones.Clear();
        foreach (var phoneRequest in request.Phones)
        {
            employee.Phones.Add(new Phone
            {
                Number = phoneRequest.Number,
                Type = phoneRequest.Type,
                EmployeeId = employee.Id
            });
        }

        await _employeeRepository.UpdateAsync(employee);
        return MapToDto(employee);
    }

    /// <summary>
    /// Exclui um colaborador
    /// </summary>
    /// <param name="id">ID do colaborador a ser excluído</param>
    /// <param name="currentUserId">ID do usuário atual realizando a operação</param>
    /// <exception cref="KeyNotFoundException">Quando colaborador não é encontrado</exception>
    /// <exception cref="UnauthorizedAccessException">Quando usuário não tem permissão</exception>
    public async Task DeleteAsync(int id, int currentUserId)
    {
        var employee = await _employeeRepository.GetByIdAsync(id);
        if (employee == null)
        {
            throw new KeyNotFoundException("Funcionário não encontrado");
        }

        if (!await _employeeRepository.CanManageRoleAsync(currentUserId, employee.Role))
        {
            throw new UnauthorizedAccessException("Você não tem permissão para excluir funcionários com este cargo");
        }

        await _employeeRepository.DeleteAsync(employee);
    }

    /// <summary>
    /// Busca colaborador por ID
    /// </summary>
    /// <param name="id">ID do colaborador</param>
    /// <returns>DTO do colaborador ou null se não encontrado</returns>
    public async Task<EmployeeDto?> GetByIdAsync(int id)
    {
        var employee = await _employeeRepository.GetByIdWithManagerAsync(id);
        return employee != null ? MapToDto(employee) : null;
    }

    /// <summary>
    /// Busca todos os colaboradores com filtro opcional
    /// </summary>
    /// <param name="search">Termo de busca (nome, sobrenome, email ou documento)</param>
    /// <returns>Lista de DTOs dos colaboradores</returns>
    public async Task<IEnumerable<EmployeeDto>> GetAllAsync(string? search = null)
    {
        var employees = await _employeeRepository.GetAllAsync(search);
        return employees.Select(MapToDto);
    }

    /// <summary>
    /// Verifica se um colaborador pode gerenciar outro com determinado cargo
    /// </summary>
    /// <param name="employeeId">ID do colaborador que está tentando gerenciar</param>
    /// <param name="targetRole">Cargo do colaborador alvo</param>
    /// <returns>True se pode gerenciar, false caso contrário</returns>
    public async Task<bool> CanManageRoleAsync(int employeeId, int targetRole)
    {
        return await _employeeRepository.CanManageRoleAsync(employeeId, (EmployeeRole)targetRole);
    }

    private static EmployeeDto MapToDto(Employee employee)
    {
        return new EmployeeDto
        {
            Id = employee.Id,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Email = employee.Email,
            Document = employee.Document,
            BirthDate = employee.BirthDate,
            Role = employee.Role,
            Department = employee.Department,
            PositionId = employee.PositionId,
            ManagerId = employee.ManagerId,
            ManagerName = employee.Manager != null ? $"{employee.Manager.FirstName} {employee.Manager.LastName}" : null,
            Phones = employee.Phones.Select(p => new PhoneDto
            {
                Id = p.Id,
                Number = p.Number,
                Type = p.Type
            }).ToList(),
            IsActive = employee.IsActive,
            CreatedAt = employee.CreatedAt,
            UpdatedAt = employee.UpdatedAt
        };
    }
}

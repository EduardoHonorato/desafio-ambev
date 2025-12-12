using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Domain.Interfaces;
using EmployeeManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Infrastructure.Repositories;

public class EmployeeRepository : Repository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(ApplicationDbContext context) : base(context)
    {
    }

    /// <summary>
    /// Busca colaborador por email
    /// </summary>
    /// <param name="email">Email do colaborador</param>
    /// <returns>Colaborador encontrado ou null</returns>
    public async Task<Employee?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(e => e.Phones)
            .FirstOrDefaultAsync(e => e.Email == email);
    }

    /// <summary>
    /// Busca colaborador por documento
    /// </summary>
    /// <param name="document">CPF/CNPJ do colaborador</param>
    /// <returns>Colaborador encontrado ou null</returns>
    public async Task<Employee?> GetByDocumentAsync(string document)
    {
        return await _dbSet
            .Include(e => e.Phones)
            .FirstOrDefaultAsync(e => e.Document == document);
    }

    /// <summary>
    /// Busca colaborador por ID incluindo dados do gerente
    /// </summary>
    /// <param name="id">ID do colaborador</param>
    /// <returns>Colaborador encontrado ou null</returns>
    public async Task<Employee?> GetByIdWithManagerAsync(int id)
    {
        return await _dbSet
            .Include(e => e.Manager)
            .Include(e => e.Phones)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    /// <summary>
    /// Busca subordinados de um gerente
    /// </summary>
    /// <param name="managerId">ID do gerente</param>
    /// <returns>Lista de colaboradores subordinados</returns>
    public async Task<IEnumerable<Employee>> GetSubordinatesAsync(int managerId)
    {
        return await _dbSet
            .Include(e => e.Phones)
            .Where(e => e.ManagerId == managerId)
            .ToListAsync();
    }

    /// <summary>
    /// Verifica se um colaborador pode gerenciar outro com determinado cargo
    /// </summary>
    /// <param name="employeeId">ID do colaborador que está tentando gerenciar</param>
    /// <param name="targetRole">Cargo do colaborador alvo</param>
    /// <returns>True se pode gerenciar, false caso contrário</returns>
    public async Task<bool> CanManageRoleAsync(int employeeId, EmployeeRole targetRole)
    {
        var employee = await GetByIdAsync(employeeId);
        if (employee == null)
        {
            return false;
        }

        if (employee.Role == EmployeeRole.Director)
        {
            return true;
        }

        if (employee.Role == EmployeeRole.Leader)
        {
            return targetRole == EmployeeRole.Employee || targetRole == EmployeeRole.Leader;
        }

        return employee.Role == EmployeeRole.Employee && targetRole == EmployeeRole.Employee;
    }

    public override async Task<IEnumerable<Employee>> GetAllAsync()
    {
        return await _dbSet
            .Include(e => e.Manager)
            .Include(e => e.Phones)
            .ToListAsync();
    }

    /// <summary>
    /// Busca todos os colaboradores com filtro opcional
    /// </summary>
    /// <param name="search">Termo de busca (nome, sobrenome, email ou documento)</param>
    /// <returns>Lista de colaboradores</returns>
    public async Task<IEnumerable<Employee>> GetAllAsync(string? search)
    {
        var query = _dbSet
            .Include(e => e.Manager)
            .Include(e => e.Phones)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(e => 
                e.FirstName.Contains(search) || 
                e.LastName.Contains(search) ||
                e.Email.Contains(search) ||
                e.Document.Contains(search));
        }

        return await query.ToListAsync();
    }

    /// <summary>
    /// Atualiza um colaborador no banco de dados
    /// </summary>
    /// <param name="entity">Entidade do colaborador com as modificações</param>
    public override async Task UpdateAsync(Employee entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
    }
}

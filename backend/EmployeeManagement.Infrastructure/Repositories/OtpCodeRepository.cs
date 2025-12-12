using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Domain.Interfaces;
using EmployeeManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Infrastructure.Repositories;

public class OtpCodeRepository : Repository<OtpCode>, IOtpCodeRepository
{
    public OtpCodeRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<OtpCode?> GetValidOtpAsync(int employeeId, string code)
    {
        return await _dbSet
            .Where(o => o.EmployeeId == employeeId 
                && o.Code == code 
                && !o.IsUsed 
                && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task InvalidateOldOtpsAsync(int employeeId)
    {
        var oldOtps = await _dbSet
            .Where(o => o.EmployeeId == employeeId && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        foreach (var otp in oldOtps)
        {
            otp.IsUsed = true;
        }

        if (oldOtps.Any())
        {
            await _context.SaveChangesAsync();
        }
    }
}


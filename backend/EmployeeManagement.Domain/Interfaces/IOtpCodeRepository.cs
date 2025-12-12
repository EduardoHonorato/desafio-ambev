using EmployeeManagement.Domain.Entities;

namespace EmployeeManagement.Domain.Interfaces;

public interface IOtpCodeRepository
{
    Task<OtpCode> AddAsync(OtpCode otp);
    Task UpdateAsync(OtpCode otp);
    Task<OtpCode?> GetValidOtpAsync(int employeeId, string code);
    Task InvalidateOldOtpsAsync(int employeeId);
}


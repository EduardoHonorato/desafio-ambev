using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Application.Services;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Domain.Interfaces;
using Moq;
using Xunit;

namespace EmployeeManagement.Tests.Services;

public class EmployeeServiceTests
{
    private readonly Mock<IEmployeeRepository> _employeeRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly EmployeeService _employeeService;

    public EmployeeServiceTests()
    {
        _employeeRepositoryMock = new Mock<IEmployeeRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _employeeService = new EmployeeService(_employeeRepositoryMock.Object, _passwordHasherMock.Object);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowException_WhenEmployeeIsUnder18()
    {
        // Arrange
        var request = new CreateEmployeeRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Document = "123456789",
            BirthDate = DateTime.Now.AddYears(-17),
            Password = "password123",
            Role = EmployeeRole.Employee,
            Phones = new List<CreatePhoneRequest> { new() { Number = "123456789", Type = "Mobile" } }
        };

        var currentUser = new Employee
        {
            Id = 1,
            Role = EmployeeRole.Director
        };

        _employeeRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(currentUser);
        _employeeRepositoryMock.Setup(r => r.CanManageRoleAsync(1, EmployeeRole.Employee)).ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _employeeService.CreateAsync(request, 1));
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowException_WhenDocumentExists()
    {
        // Arrange
        var request = new CreateEmployeeRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Document = "123456789",
            BirthDate = DateTime.Now.AddYears(-25),
            Password = "password123",
            Role = EmployeeRole.Employee,
            Phones = new List<CreatePhoneRequest> { new() { Number = "123456789", Type = "Mobile" } }
        };

        var currentUser = new Employee
        {
            Id = 1,
            Role = EmployeeRole.Director
        };

        _employeeRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(currentUser);
        _employeeRepositoryMock.Setup(r => r.CanManageRoleAsync(1, EmployeeRole.Employee)).ReturnsAsync(true);
        _employeeRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Employee, bool>>>()))
            .ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _employeeService.CreateAsync(request, 1));
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateEmployee_WhenValid()
    {
        // Arrange
        var request = new CreateEmployeeRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Document = "123456789",
            BirthDate = DateTime.Now.AddYears(-25),
            Password = "password123",
            Role = EmployeeRole.Employee,
            Department = "IT",
            Phones = new List<CreatePhoneRequest> { new() { Number = "123456789", Type = "Mobile" } }
        };

        var currentUser = new Employee
        {
            Id = 1,
            Role = EmployeeRole.Director
        };

        var createdEmployee = new Employee
        {
            Id = 2,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Document = request.Document,
            BirthDate = request.BirthDate,
            Role = request.Role,
            Department = request.Department,
            CreatedAt = DateTime.UtcNow,
            Phones = new List<Phone>
            {
                new Phone { Number = "123456789", Type = "Mobile" }
            }
        };

        _employeeRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(currentUser);
        _employeeRepositoryMock.Setup(r => r.CanManageRoleAsync(1, EmployeeRole.Employee)).ReturnsAsync(true);
        _employeeRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Employee, bool>>>()))
            .ReturnsAsync(false);
        _passwordHasherMock.Setup(h => h.HashPassword(It.IsAny<string>())).Returns("hashed_password");
        _employeeRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Employee>())).ReturnsAsync(createdEmployee);

        // Act
        var result = await _employeeService.CreateAsync(request, 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(request.FirstName, result.FirstName);
        Assert.Equal(request.LastName, result.LastName);
        Assert.Equal(request.Email, result.Email);
        _employeeRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Employee>()), Times.Once);
    }
}

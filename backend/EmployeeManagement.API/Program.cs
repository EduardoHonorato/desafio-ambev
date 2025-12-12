using EmployeeManagement.Application;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Domain.Interfaces;
using EmployeeManagement.Infrastructure;
using EmployeeManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Employee Management API",
        Version = "v1",
        Description = "API para gestão de funcionários",
        Contact = new OpenApiContact
        {
            Name = "Employee Management",
            Email = "contact@employeemanagement.com"
        }
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:3005")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "EmployeeManagement";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "EmployeeManagement";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// Add Application and Infrastructure layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Employee Management API v1");
        c.RoutePrefix = string.Empty; // Swagger UI at root
    });
}

app.UseSerilogRequestLogging();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database is created and seed initial data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = services.GetRequiredService<IPasswordHasher>();
        
        // Create database and apply migrations
        context.Database.EnsureCreated();
        
        // Manually create tables if they don't exist
        await context.Database.ExecuteSqlRawAsync(@"
            CREATE TABLE IF NOT EXISTS `Departments` (
                `Id` int NOT NULL AUTO_INCREMENT,
                `Name` varchar(100) NOT NULL,
                `Description` varchar(500) NULL,
                `IsActive` tinyint(1) NOT NULL,
                `CreatedAt` datetime(6) NOT NULL,
                `UpdatedAt` datetime(6) NOT NULL,
                CONSTRAINT `PK_Departments` PRIMARY KEY (`Id`),
                UNIQUE KEY `IX_Departments_Name` (`Name`)
            ) ENGINE=InnoDB;
        ");
        
        await context.Database.ExecuteSqlRawAsync(@"
            CREATE TABLE IF NOT EXISTS `Positions` (
                `Id` int NOT NULL AUTO_INCREMENT,
                `Name` varchar(100) NOT NULL,
                `Description` varchar(500) NULL,
                `DepartmentId` int NOT NULL,
                `IsActive` tinyint(1) NOT NULL,
                `CreatedAt` datetime(6) NOT NULL,
                `UpdatedAt` datetime(6) NOT NULL,
                CONSTRAINT `PK_Positions` PRIMARY KEY (`Id`),
                KEY `IX_Positions_DepartmentId` (`DepartmentId`),
                UNIQUE KEY `IX_Positions_Name_DepartmentId` (`Name`, `DepartmentId`),
                CONSTRAINT `FK_Positions_Departments_DepartmentId` FOREIGN KEY (`DepartmentId`) REFERENCES `Departments` (`Id`) ON DELETE RESTRICT
            ) ENGINE=InnoDB;
        ");
        
        // Add columns to Employees table if they don't exist
        try {
            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE `Employees` 
                ADD COLUMN `DepartmentId` int NULL,
                ADD COLUMN `PositionId` int NULL,
                ADD COLUMN `IsActive` tinyint(1) NOT NULL DEFAULT 1;
            ");
        } catch {
            // Columns might already exist, ignore error
        }
        
        try {
            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE `Employees` 
                ADD CONSTRAINT `FK_Employees_Departments_DepartmentId` FOREIGN KEY (`DepartmentId`) REFERENCES `Departments` (`Id`) ON DELETE SET NULL,
                ADD CONSTRAINT `FK_Employees_Positions_PositionId` FOREIGN KEY (`PositionId`) REFERENCES `Positions` (`Id`) ON DELETE SET NULL;
            ");
        } catch {
            // Constraints might already exist, ignore error
        }
        
        // Create OtpCodes table if it doesn't exist
        await context.Database.ExecuteSqlRawAsync(@"
            CREATE TABLE IF NOT EXISTS `OtpCodes` (
                `Id` int NOT NULL AUTO_INCREMENT,
                `EmployeeId` int NOT NULL,
                `Code` varchar(6) NOT NULL,
                `ExpiresAt` datetime(6) NOT NULL,
                `IsUsed` tinyint(1) NOT NULL,
                `CreatedAt` datetime(6) NOT NULL,
                CONSTRAINT `PK_OtpCodes` PRIMARY KEY (`Id`),
                KEY `IX_OtpCodes_EmployeeId` (`EmployeeId`),
                CONSTRAINT `FK_OtpCodes_Employees_EmployeeId` FOREIGN KEY (`EmployeeId`) REFERENCES `Employees` (`Id`) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        ");
        
        // Seed departments and positions
        await EmployeeManagement.Infrastructure.Data.DataSeeder.SeedAsync(context);
        
        // Seed initial admin user if no users exist
        if (!context.Employees.Any())
        {
            var adminEmployee = new Employee
            {
                FirstName = "Admin",
                LastName = "Sistema",
                Email = "admin@example.com",
                Document = "12345678900",
                BirthDate = new DateTime(1990, 1, 1),
                PasswordHash = passwordHasher.HashPassword("admin123"),
                Role = EmployeeRole.Director,
                Department = "TI",
                CreatedAt = DateTime.UtcNow,
                Phones = new List<Phone>
                {
                    new Phone
                    {
                        Number = "11999999999",
                        Type = "Mobile"
                    }
                }
            };
            
            context.Employees.Add(adminEmployee);
            context.SaveChanges();
            Log.Information("Initial admin user created successfully. Email: admin@example.com, Password: admin123");
        }
        
        Log.Information("Database initialized successfully");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred while initializing the database");
    }
}

app.Run();

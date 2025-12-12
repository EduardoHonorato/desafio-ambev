using EmployeeManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Seed Departments
        if (!await context.Departments.AnyAsync())
        {
            var departments = new[]
            {
                new Department { Name = "Recursos Humanos", Description = "Gestão de pessoas e processos administrativos", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Name = "Tecnologia da Informação", Description = "Desenvolvimento e manutenção de sistemas", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Name = "Financeiro", Description = "Controle financeiro e contabilidade", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Name = "Vendas", Description = "Gestão comercial e relacionamento com clientes", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Name = "Marketing", Description = "Estratégias de marketing e comunicação", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Name = "Operações", Description = "Gestão operacional e logística", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Name = "Jurídico", Description = "Assessoria jurídica e compliance", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Department { Name = "Qualidade", Description = "Controle de qualidade e processos", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };

            await context.Departments.AddRangeAsync(departments);
            await context.SaveChangesAsync();
        }

        // Seed Positions
        if (!await context.Positions.AnyAsync())
        {
            var departments = await context.Departments.ToListAsync();
            var positions = new List<Position>();

            // RH Positions
            var rhDept = departments.First(d => d.Name == "Recursos Humanos");
            positions.AddRange(new[]
            {
                new Position { Name = "Analista de RH", Description = "Análise de processos de recursos humanos", DepartmentId = rhDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Coordenador de RH", Description = "Coordenação da equipe de recursos humanos", DepartmentId = rhDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Gerente de RH", Description = "Gestão estratégica de recursos humanos", DepartmentId = rhDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Especialista em Recrutamento", Description = "Recrutamento e seleção de talentos", DepartmentId = rhDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            });

            // TI Positions
            var tiDept = departments.First(d => d.Name == "Tecnologia da Informação");
            positions.AddRange(new[]
            {
                new Position { Name = "Desenvolvedor Junior", Description = "Desenvolvimento de software", DepartmentId = tiDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Desenvolvedor Pleno", Description = "Desenvolvimento de software com experiência", DepartmentId = tiDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Desenvolvedor Senior", Description = "Desenvolvimento de software avançado", DepartmentId = tiDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Analista de Sistemas", Description = "Análise e especificação de sistemas", DepartmentId = tiDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Arquiteto de Software", Description = "Arquitetura e design de sistemas", DepartmentId = tiDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "DevOps Engineer", Description = "Infraestrutura e deploy de aplicações", DepartmentId = tiDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Gerente de TI", Description = "Gestão da equipe de tecnologia", DepartmentId = tiDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            });

            // Financeiro Positions
            var finDept = departments.First(d => d.Name == "Financeiro");
            positions.AddRange(new[]
            {
                new Position { Name = "Analista Financeiro", Description = "Análise financeira e orçamentária", DepartmentId = finDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Contador", Description = "Contabilidade geral", DepartmentId = finDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Controller", Description = "Controladoria financeira", DepartmentId = finDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Gerente Financeiro", Description = "Gestão financeira estratégica", DepartmentId = finDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            });

            // Vendas Positions
            var vendasDept = departments.First(d => d.Name == "Vendas");
            positions.AddRange(new[]
            {
                new Position { Name = "Vendedor", Description = "Vendas diretas", DepartmentId = vendasDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Consultor de Vendas", Description = "Consultoria em vendas", DepartmentId = vendasDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Coordenador de Vendas", Description = "Coordenação da equipe de vendas", DepartmentId = vendasDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Gerente de Vendas", Description = "Gestão estratégica de vendas", DepartmentId = vendasDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            });

            // Marketing Positions
            var marketingDept = departments.First(d => d.Name == "Marketing");
            positions.AddRange(new[]
            {
                new Position { Name = "Analista de Marketing", Description = "Análise de campanhas de marketing", DepartmentId = marketingDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Designer Gráfico", Description = "Criação de materiais visuais", DepartmentId = marketingDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Social Media", Description = "Gestão de redes sociais", DepartmentId = marketingDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Position { Name = "Gerente de Marketing", Description = "Gestão estratégica de marketing", DepartmentId = marketingDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            });

            await context.Positions.AddRangeAsync(positions);
            await context.SaveChangesAsync();
        }
    }
}
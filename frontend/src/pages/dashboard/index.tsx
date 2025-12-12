import { useEmployees } from '../employees/hooks/useEmployees';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatDate, getInitials } from '@/utils';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, EMPLOYEE_ROLE_LABELS_BY_ID } from '@/config';

export const DashboardPage = () => {
  const { data: employees, isLoading } = useEmployees();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!employees) return null;

    // Total de funcionários
    const total = employees.length;

    // Funcionários ativos/inativos (usando dados reais da API)
    const active = employees.filter(e => e.isActive).length;
    const inactive = employees.filter(e => !e.isActive).length;

    // Departamentos únicos
    const departments = new Set(employees.filter(e => e.department).map(e => e.department));
    const totalDepartments = departments.size;

    // Departamento com mais funcionários
    const departmentCounts: Record<string, number> = {};
    employees.forEach(emp => {
      if (emp.department) {
        departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
      }
    });
    const topDepartment = Object.entries(departmentCounts)
      .sort(([, a], [, b]) => b - a)[0] || null;

    // Top 5 departamentos
    const top5Departments = Object.entries(departmentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Top 5 cargos/funções
    const positionCounts: Record<string, number> = {};
    employees.forEach(emp => {
      const position = emp.department || 'Sem departamento';
      positionCounts[position] = (positionCounts[position] || 0) + 1;
    });
    const top5Positions = Object.entries(positionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Últimos 5 colaboradores cadastrados
    const last5Employees = [...employees]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Por cargo hierárquico (usando números da API)
    const byRole = {
      Employee: employees.filter(e => e.role === 1).length,
      Leader: employees.filter(e => e.role === 2).length,
      Director: employees.filter(e => e.role === 3).length,
    };

    return {
      total,
      active,
      inactive,
      totalDepartments,
      topDepartment,
      top5Departments,
      top5Positions,
      last5Employees,
      byRole,
    };
  }, [employees]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="text-sm text-gray-600">
          <span className="text-gray-400">Home</span> / <span className="text-gray-900">Dashboard</span>
        </div>
      </div>

      {/* Widgets Top Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Funcionários */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total de Funcionários</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100">
                  +20%
                </span>
                <span className="text-xs text-gray-500">Vs mês anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funcionários Ativos */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Colaboradores Ativos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100">
                  +4%
                </span>
                <span className="text-xs text-gray-500">Vs mês anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Departamentos */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total de Departamentos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDepartments}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {stats.totalDepartments > 0 ? 'Ativo' : 'Vazio'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Departamento com Mais Funcionários */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Maior Departamento</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.topDepartment ? stats.topDepartment[0] : '—'}
              </p>
              <p className="text-sm text-gray-600">
                {stats.topDepartment ? `${stats.topDepartment[1]} funcionários` : 'Nenhum'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Departamentos */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Top 5 Departamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.top5Departments.length > 0 ? (
                stats.top5Departments.map((dept, index) => (
                  <div
                    key={dept.name}
                    className="flex items-center justify-between p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                      <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      {dept.count}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum departamento cadastrado</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Cargos */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Top 5 Cargos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.top5Positions.length > 0 ? (
                stats.top5Positions.map((pos, index) => (
                  <div
                    key={pos.name}
                    className="flex items-center justify-between p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                      <span className="text-sm font-medium text-gray-900">{pos.name}</span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      {pos.count}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum cargo cadastrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - More Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Por Cargo Hierárquico */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Colaboradores por Cargo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-900">Colaborador</span>
                <Badge variant="secondary" className="bg-gray-100">
                  {stats.byRole.Employee}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-900">Líder</span>
                <Badge variant="secondary" className="bg-amber-100">
                  {stats.byRole.Leader}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-900">Diretor</span>
                <Badge variant="secondary" className="bg-blue-100">
                  {stats.byRole.Director}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Ativo/Inativo */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Status dos Colaboradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-900">Ativos</span>
                <Badge className="bg-emerald-100">
                  {stats.active}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-900">Inativos</span>
                <Badge className="bg-red-100">
                  {stats.inactive}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimos Funcionários Cadastrados */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">5 Últimos Colaboradores Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Nome</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Data</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Departamento</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Cargo</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.last5Employees.length > 0 ? (
                  stats.last5Employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b border-gray-100"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(employee.firstName, employee.lastName)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{employee.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(employee.createdAt)}</td>
                      <td className="py-3 px-4">
                        {employee.department ? (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            {employee.department}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          {EMPLOYEE_ROLE_LABELS_BY_ID[employee.role] || '—'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={employee.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                          {employee.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                      Nenhum colaborador cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

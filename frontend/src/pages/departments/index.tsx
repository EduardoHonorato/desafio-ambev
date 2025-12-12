import { useState, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { DataTableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/components/ui/toast';
import { ROUTES } from '@/config';
import { Plus, Edit, Trash2, Building2, Users, Briefcase, MoreVertical } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useDepartments, useDeleteDepartment } from './hooks/useDepartments';
import type { Department } from '@/hooks/useDepartments';
import { formatDate } from '@/utils';

export const DepartmentsPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedSearch, setAppliedSearch] = useState('');
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const { addToast } = useToast();

  const { data: response, isLoading, error } = useDepartments(currentPage, 10, appliedSearch);
  const deleteDepartment = useDeleteDepartment();

  const handleDelete = (department: Department) => {
    setDepartmentToDelete(department);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await deleteDepartment.mutateAsync(departmentToDelete.id);
      addToast({
        type: 'success',
        title: 'Departamento excluído',
        description: `O departamento "${departmentToDelete.name}" foi excluído com sucesso.`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao excluir',
        description: (error as Error).message,
      });
    } finally {
      setDepartmentToDelete(null);
    }
  };

  const columns: DataTableColumn<Department>[] = [
    {
      key: 'name',
      title: 'Departamento',
      render: (department) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="font-medium text-gray-900">{department.name}</div>
        </div>
      )
    },
    {
      key: 'description',
      title: 'Descrição',
      render: (department) => department.description || <span className="text-gray-400">—</span>
    },
    {
      key: 'employeeCount',
      title: 'Colaboradores',
      render: (department) => (
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-1" />
          {department.employeeCount || 0}
        </div>
      )
    },
    {
      key: 'positionCount',
      title: 'Cargos',
      render: (department) => (
        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="h-4 w-4 mr-1" />
          {department.positionCount || 0}
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (department) => (
        <Badge variant={department.isActive ? 'default' : 'secondary'} className={department.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
          {department.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (department) => (
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpenMenuId(openMenuId === department.id ? null : department.id)}
            className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </Button>

          {openMenuId === department.id && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-32">
              <button
                onClick={() => {
                  navigate(`/departments/edit/${department.id}`);
                  setOpenMenuId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  handleDelete(department);
                  setOpenMenuId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
              >
                Excluir
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <p className="text-red-600">Erro ao carregar departamentos: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const departments = response?.data || [];
  const meta = response?.meta;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
        </div>
        <div className="text-sm text-gray-600">
          <Link to="/" className="text-gray-400 hover:text-gray-600 cursor-pointer">Home</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900">Departamentos</span>
        </div>
      </div>

      <DataTable
        title="Lista de Departamentos"
        columns={columns}
        data={departments}
        loading={isLoading}
        searchPlaceholder="Buscar departamentos..."
        emptyMessage={appliedSearch ? 'Nenhum departamento encontrado' : 'Nenhum departamento cadastrado'}
        onSearchChange={setAppliedSearch}
        pagination={meta ? {
          currentPage: meta.page,
          totalPages: meta.totalPages,
          totalItems: meta.qtdItens,
          itemsPerPage: meta.perPage,
          onPageChange: setCurrentPage
        } : undefined}
        actions={
          <Button
            onClick={() => navigate(ROUTES.departmentsCreate)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Departamento
          </Button>
        }
      />

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={!!departmentToDelete}
        onClose={() => setDepartmentToDelete(null)}
        onConfirm={confirmDelete}
        title="Excluir Departamento"
        description={`Tem certeza que deseja excluir o departamento '${departmentToDelete?.name}'? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        isLoading={deleteDepartment.isPending}
      />
    </div>
  );
};

export default DepartmentsPage;
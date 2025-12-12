import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { DataTableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { SelectField } from '@/components/ui/select-field';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/components/ui/toast';
import { ROUTES } from '@/config';
import { Plus, Edit, Trash2, Briefcase, Users, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePositions, useDeletePosition } from '@/hooks/usePositions';
import type { Position } from '@/hooks/usePositions';
import { useDepartments } from '@/hooks/useDepartments';
import { formatDate } from '@/utils';

export const PositionsPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const { addToast } = useToast();

  const { data: departmentsResponse } = useDepartments(1, 100); // Buscar todos para o filtro
  const { data: positionsResponse, isLoading, error } = usePositions(currentPage, 10, searchTerm);
  const deleteMutation = useDeletePosition();

  const departments = departmentsResponse?.data || [];
  const positions = positionsResponse?.data || [];
  const meta = positionsResponse?.meta;

  const departmentOptions = departments.map(dept => ({
    value: dept.name,
    label: dept.name
  }));

  const handleDelete = (position: Position) => {
    setPositionToDelete(position);
  };

  const confirmDelete = async () => {
    if (!positionToDelete) return;

    try {
      await deleteMutation.mutateAsync(positionToDelete.id);
      addToast({
        type: 'success',
        title: 'Cargo excluído',
        description: `O cargo "${positionToDelete.name}" foi excluído com sucesso.`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao excluir',
        description: (error as Error).message,
      });
    } finally {
      setPositionToDelete(null);
    }
  };

  const columns: DataTableColumn<Position>[] = [
    {
      key: 'name',
      title: 'Cargo',
      render: (position) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <Briefcase className="h-4 w-4 text-purple-600" />
          </div>
          <div className="font-medium text-gray-900">{position.name}</div>
        </div>
      )
    },
    {
      key: 'description',
      title: 'Descrição',
      render: (position) => position.description || <span className="text-gray-400">—</span>
    },
    {
      key: 'departmentName',
      title: 'Departamento',
      render: (position) => (
        <div className="flex items-center text-sm text-gray-600">
          <Building2 className="h-4 w-4 mr-1" />
          {position.departmentName}
        </div>
      )
    },
    {
      key: 'employeeCount',
      title: 'Funcionários',
      render: (position) => (
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-1" />
          {position.employeeCount || 0}
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (position) => (
        <Badge variant={position.isActive ? 'default' : 'secondary'}>
          {position.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      title: 'Criado em',
      render: (position) => formatDate(position.createdAt)
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (position) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/positions/edit/${position.id}`)}
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(position)}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <p className="text-red-600">Erro ao carregar cargos: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  // Filtrar por departamento se selecionado
  const filteredPositions = departmentFilter
    ? positions.filter(pos => pos.departmentName === departmentFilter)
    : positions;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cargos</h1>
        </div>
        <div className="text-sm text-gray-600">
          <span className="text-gray-400">Home</span> / <span className="text-gray-900">Cargos</span>
        </div>
      </div>

      <DataTable
        title="Lista de Cargos"
        columns={columns}
        data={filteredPositions}
        loading={isLoading}
        searchPlaceholder="Buscar cargos..."
        emptyMessage={searchTerm ? 'Nenhum cargo encontrado' : 'Nenhum cargo cadastrado'}
        onSearchChange={setSearchTerm}
        pagination={meta ? {
          currentPage: meta.page,
          totalPages: meta.totalPages,
          totalItems: meta.qtdItens,
          itemsPerPage: meta.perPage,
          onPageChange: setCurrentPage
        } : undefined}
        filters={
          <div className="relative w-48">
            <SelectField
              options={[
                { value: '', label: 'Todos os departamentos' },
                ...departmentOptions
              ]}
              value={departmentFilter}
              onChange={(value) => {
                setDepartmentFilter(value as string);
                setCurrentPage(1);
              }}
              placeholder="Filtrar por departamento"
              allowSearch={false}
            />
          </div>
        }
        actions={
          <Button
            onClick={() => navigate(ROUTES.positionsCreate)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cargo
          </Button>
        }
      />

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={!!positionToDelete}
        onClose={() => setPositionToDelete(null)}
        onConfirm={confirmDelete}
        title="Excluir Cargo"
        description={`Tem certeza que deseja excluir o cargo "${positionToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { DataTableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { SelectField } from '@/components/ui/select-field';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/components/ui/toast';
import { ROUTES } from '@/config';
import { Plus, Edit, Trash2, Briefcase, Users, Building2, MoreVertical } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { usePositions, useDeletePosition } from './hooks/usePositions';
import type { Position } from './hooks/usePositions';
import { useDepartments } from '../departments/hooks/useDepartments';
import { formatDate } from '@/utils';

export const PositionsPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedSearch, setAppliedSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !buttonRefs.current[openMenuId]?.contains(event.target as Node)) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenuId]);
  const { addToast } = useToast();

  const { data: departmentsResponse } = useDepartments(1, 100); // Buscar todos para o filtro
  const deletePosition = useDeletePosition();

  const departments = departmentsResponse?.data || [];
  const selectedDepartment = departments.find(d => d.name === departmentFilter);
  const departmentId = selectedDepartment?.id;
  const { data: positionsResponse, isLoading, error } = usePositions(currentPage, 10, appliedSearch, departmentId);
  
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
      await deletePosition.mutateAsync(positionToDelete.id);
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
      title: 'Colaboradores',
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
        <Badge variant={position.isActive ? 'default' : 'secondary'} className={position.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
          {position.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (position) => (
        <div className="relative">
          <Button
            ref={(el) => (buttonRefs.current[position.id] = el)}
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (openMenuId === position.id) {
                setOpenMenuId(null);
                setMenuPosition(null);
              } else {
                const rect = e.currentTarget.getBoundingClientRect();
                setMenuPosition({
                  top: rect.bottom + 4,
                  left: rect.left - 120
                });
                setOpenMenuId(position.id);
              }
            }}
            className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
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

  // Não precisa filtrar localmente, a API já retorna filtrado

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cargos</h1>
        </div>
        <div className="text-sm text-gray-600">
          <Link to="/" className="text-gray-400 hover:text-gray-600 cursor-pointer">Home</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900">Cargos</span>
        </div>
      </div>

      <DataTable
        title="Lista de Cargos"
        columns={columns}
        data={positions}
        loading={isLoading}
        searchPlaceholder="Buscar cargos..."
        emptyMessage={appliedSearch || departmentFilter ? 'Nenhum cargo encontrado' : 'Nenhum cargo cadastrado'}
        onSearchChange={setAppliedSearch}
        pagination={meta ? {
          currentPage: meta.page,
          totalPages: meta.totalPages,
          totalItems: meta.qtdItens,
          itemsPerPage: meta.perPage,
          onPageChange: setCurrentPage
        } : undefined}
        filters={
          <div className="relative" style={{ width: 'calc(12rem + 80px)' }}>
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
              allowSearch={true}
              className="w-full"
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
        description={`Tem certeza que deseja excluir o cargo '${positionToDelete?.name}'? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        isLoading={deletePosition.isPending}
      />

      {/* Menu flutuante via Portal */}
      {openMenuId !== null && menuPosition !== null && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[9999] bg-white border border-gray-200 rounded-md shadow-lg w-32"
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const position = positions.find(p => p.id === openMenuId);
              if (position) {
                setOpenMenuId(null);
                setMenuPosition(null);
                navigate(`/positions/edit/${position.id}`);
              }
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md"
          >
            Editar
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const position = positions.find(p => p.id === openMenuId);
              if (position) {
                setOpenMenuId(null);
                setMenuPosition(null);
                handleDelete(position);
              }
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer last:rounded-b-md"
          >
            Excluir
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PositionsPage;
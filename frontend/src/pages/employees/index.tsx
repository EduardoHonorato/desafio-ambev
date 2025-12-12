import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useEmployees, useDeleteEmployee } from './hooks/useEmployees';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { DataTableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/components/ui/toast';
import { Plus, MoreVertical } from 'lucide-react';
import { ROUTES, EMPLOYEE_ROLE_LABELS_BY_ID } from '@/config';
import { getInitials, maskDocument, maskPhone } from '@/utils';
import type { EmployeeDto } from '@/services/authService';

export const EmployeesPage = () => {
  const navigate = useNavigate();
  const [appliedSearch, setAppliedSearch] = useState('');
  const { data: employees, isLoading } = useEmployees(appliedSearch);
  const deleteEmployee = useDeleteEmployee();
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeDto | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const { addToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const target = event.target as Node;
        const button = buttonRefs.current[openMenuId];
        const menuElement = document.getElementById('floating-menu');

        if (button && !button.contains(target) && menuElement && !menuElement.contains(target)) {
          setOpenMenuId(null);
          setMenuPosition(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const handleDelete = (employee: EmployeeDto) => {
    setEmployeeToDelete(employee);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployee.mutateAsync(employeeToDelete.id);
      addToast({
        type: 'success',
        title: 'Funcionário excluído',
        description: `${employeeToDelete.firstName} ${employeeToDelete.lastName} foi excluído com sucesso.`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao excluir',
        description: (error as Error).message,
      });
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const handleEdit = (employee: EmployeeDto) => {
    navigate(`/employees/edit/${employee.id}`);
    setOpenMenuId(null);
    setMenuPosition(null);
  };

  const handleMenuToggle = (employee: EmployeeDto, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (openMenuId === employee.id) {
      setOpenMenuId(null);
      setMenuPosition(null);
      return;
    }

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.right + window.scrollX - 128, // 128px = w-32
    });

    setOpenMenuId(employee.id);
    buttonRefs.current[employee.id] = button;
  };

  const getPrimaryPhone = (employee: EmployeeDto) => {
    if (!employee.phones || employee.phones.length === 0) return '—';
    return maskPhone(employee.phones[0].number);
  };

  const columns: DataTableColumn<EmployeeDto>[] = [
    {
      key: 'name',
      title: 'Colaborador',
      render: (employee) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">
              {getInitials(employee.firstName || '', employee.lastName || '')}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {employee.firstName} {employee.lastName}
            </div>
            <div className="text-sm text-gray-500">{employee.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      title: 'Telefone',
      render: (employee) => (
        <span className="text-sm text-gray-600">{getPrimaryPhone(employee)}</span>
      )
    },
    {
      key: 'document',
      title: 'CPF/CNPJ',
      render: (employee) => (
        <span className="text-sm text-gray-600">{maskDocument(employee.document)}</span>
      )
    },
    {
      key: 'position',
      title: 'Cargo',
      render: (employee) => (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          {employee.position || EMPLOYEE_ROLE_LABELS_BY_ID[employee.role as keyof typeof EMPLOYEE_ROLE_LABELS_BY_ID] || '—'}
        </Badge>
      )
    },
    {
      key: 'department',
      title: 'Departamento',
      render: (employee) => (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          {employee.department || '—'}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (employee) => (
        <Badge variant={employee.isActive !== false ? 'default' : 'secondary'} className={employee.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
          {employee.isActive !== false ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (employee) => (
        <Button
          ref={(el) => { buttonRefs.current[employee.id] = el; }}
          variant="ghost"
          size="sm"
          onClick={(e) => handleMenuToggle(employee, e)}
          className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
        >
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </Button>
      )
    }
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
        </div>
        <div className="text-sm text-gray-600">
          <Link to="/" className="text-gray-400 hover:text-gray-600 cursor-pointer">Home</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900">Colaboradores</span>
        </div>
      </div>

      <DataTable
        title="Lista de Colaboradores"
        columns={columns}
        data={employees || []}
        loading={isLoading}
        searchPlaceholder="Buscar colaboradores..."
        emptyMessage={appliedSearch ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador cadastrado'}
        onSearchChange={setAppliedSearch}
        actions={
          <Button
            onClick={() => navigate(ROUTES.employeesCreate)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Colaborador
          </Button>
        }
      />

      {/* Menu Flutuante */}
      {openMenuId !== null && menuPosition && createPortal(
        <div
          id="floating-menu"
          className="fixed bg-white border border-gray-200 rounded-md shadow-lg w-32"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => {
              const employee = employees?.find(emp => emp.id === openMenuId);
              if (employee) handleEdit(employee);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            Editar
          </button>
          <button
            onClick={() => {
              const employee = employees?.find(emp => emp.id === openMenuId);
              if (employee) {
                handleDelete(employee);
                setOpenMenuId(null);
                setMenuPosition(null);
              }
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
          >
            Excluir
          </button>
        </div>,
        document.body
      )}

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={confirmDelete}
        title="Excluir Colaborador"
        description={`Tem certeza que deseja excluir o colaborador '${employeeToDelete?.firstName} ${employeeToDelete?.lastName}'? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        isLoading={deleteEmployee.isPending}
      />
    </div>
  );
};

export default EmployeesPage;

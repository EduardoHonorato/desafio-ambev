import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/authService';
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from '@/services/authService';

/**
 * Busca de colaboradores
 * @param {string} search - Busca pelo nome, sobrenome, email ou documento
 * @type {GET} - Método utilizado
 * @returns {array} Retorna array de colaboradores
 */
export const useEmployees = (search?: string) => {
  return useQuery({
    queryKey: ['employees', search],
    queryFn: () => employeeService.getAll(search),
  });
};

/**
 * Busca de colaborador por ID
 * @param {number} id - ID do colaborador
 * @type {GET} - Método utilizado
 * @returns {object} Retorna dados do colaborador
 */
export const useEmployee = (id: number) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  });
};

/**
 * Criação de colaborador
 * @param {CreateEmployeeRequest} data - Dados do colaborador a ser criado
 * @type {POST} - Método utilizado
 * @returns {object} Retorna dados do colaborador criado
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

/**
 * Atualização de colaborador
 * @param {number} id - ID do colaborador
 * @param {UpdateEmployeeRequest} data - Dados atualizados do colaborador
 * @type {PUT} - Método utilizado
 * @returns {void}
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeRequest }) =>
      employeeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    },
  });
};

/**
 * Exclusão de colaborador
 * @param {number} id - ID do colaborador a ser excluído
 * @type {DELETE} - Método utilizado
 * @returns {void}
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

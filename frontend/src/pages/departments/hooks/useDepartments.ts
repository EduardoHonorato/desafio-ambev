import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config';

export interface Department {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  employeeCount: number;
  positionCount: number;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  description?: string;
  isActive: boolean;
}

const departmentService = {
  getAll: async (page: number = 1, perPage: number = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
      ...(search && { search })
    });
    const response = await fetch(`${API_ENDPOINTS.departments}?${params}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar departamentos');
    }
    return response.json();
  },

  getById: async (id: number): Promise<Department> => {
    const response = await fetch(`${API_ENDPOINTS.departments}/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar departamento');
    }
    return response.json();
  },

  create: async (data: CreateDepartmentRequest): Promise<Department> => {
    const response = await fetch(API_ENDPOINTS.departments, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar departamento');
    }
    return response.json();
  },

  update: async (id: number, data: UpdateDepartmentRequest): Promise<void> => {
    const response = await fetch(`${API_ENDPOINTS.departments}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar departamento');
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_ENDPOINTS.departments}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao excluir departamento');
    }
  },
};

/**
 * Busca de departamentos
 * @param {number} page - Número da página
 * @param {number} perPage - Itens por página
 * @param {string} search - Busca pelo nome ou descrição
 * @type {GET} - Método utilizado
 * @returns {object} Retorna objeto com data (array de departamentos) e meta (informações de paginação)
 */
export const useDepartments = (page: number = 1, perPage: number = 10, search?: string) => {
  return useQuery({
    queryKey: ['departments', page, perPage, search],
    queryFn: () => departmentService.getAll(page, perPage, search),
  });
};

/**
 * Busca de departamento por ID
 * @param {number} id - ID do departamento
 * @type {GET} - Método utilizado
 * @returns {object} Retorna dados do departamento
 */
export const useDepartment = (id: number) => {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: () => departmentService.getById(id),
    enabled: !!id,
  });
};

/**
 * Criação de departamento
 * @param {CreateDepartmentRequest} data - Dados do departamento a ser criado
 * @type {POST} - Método utilizado
 * @returns {object} Retorna dados do departamento criado
 */
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: departmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

/**
 * Atualização de departamento
 * @param {number} id - ID do departamento
 * @param {UpdateDepartmentRequest} data - Dados atualizados do departamento
 * @type {PUT} - Método utilizado
 * @returns {void}
 */
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentRequest }) =>
      departmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

/**
 * Exclusão de departamento
 * @param {number} id - ID do departamento a ser excluído
 * @type {DELETE} - Método utilizado
 * @returns {void}
 */
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: departmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config';

export interface Position {
  id: number;
  name: string;
  description?: string;
  departmentId: number;
  departmentName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  employeeCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    qtdItens: number;
    totalPages: number;
  };
}

export interface CreatePositionRequest {
  name: string;
  description?: string;
  departmentId: number;
}

export interface UpdatePositionRequest {
  name: string;
  description?: string;
  departmentId: number;
  isActive: boolean;
}

const positionService = {
  getAll: async (page: number = 1, perPage: number = 10, search?: string, departmentId?: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
      ...(search && { search }),
      ...(departmentId && { departmentId: departmentId.toString() })
    });

    const response = await fetch(`${API_ENDPOINTS.positions}?${params}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar cargos');
    }
    return response.json();
  },

  getById: async (id: number): Promise<Position> => {
    const response = await fetch(`${API_ENDPOINTS.positions}/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar cargo');
    }
    return response.json();
  },

  create: async (data: CreatePositionRequest): Promise<Position> => {
    const response = await fetch(API_ENDPOINTS.positions, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar cargo');
    }
    return response.json();
  },

  update: async (id: number, data: UpdatePositionRequest): Promise<void> => {
    const response = await fetch(`${API_ENDPOINTS.positions}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar cargo');
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_ENDPOINTS.positions}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao excluir cargo');
    }
  },
};

/**
 * Busca de cargos
 * @param {number} page - Número da página
 * @param {number} perPage - Itens por página
 * @param {string} search - Busca pelo nome ou descrição
 * @param {number} departmentId - ID do departamento para filtrar
 * @type {GET} - Método utilizado
 * @returns {object} Retorna objeto com data (array de cargos) e meta (informações de paginação)
 */
export const usePositions = (page: number = 1, perPage: number = 10, search?: string, departmentId?: number) => {
  return useQuery({
    queryKey: ['positions', page, perPage, search, departmentId],
    queryFn: () => positionService.getAll(page, perPage, search, departmentId),
  });
};

/**
 * Busca de cargo por ID
 * @param {number} id - ID do cargo
 * @type {GET} - Método utilizado
 * @returns {object} Retorna dados do cargo
 */
export const usePosition = (id: number) => {
  return useQuery({
    queryKey: ['positions', id],
    queryFn: () => positionService.getById(id),
    enabled: !!id,
  });
};

/**
 * Criação de cargo
 * @param {CreatePositionRequest} data - Dados do cargo a ser criado
 * @type {POST} - Método utilizado
 * @returns {object} Retorna dados do cargo criado
 */
export const useCreatePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: positionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
};

/**
 * Atualização de cargo
 * @param {number} id - ID do cargo
 * @param {UpdatePositionRequest} data - Dados atualizados do cargo
 * @type {PUT} - Método utilizado
 * @returns {void}
 */
export const useUpdatePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePositionRequest }) =>
      positionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
};

/**
 * Exclusão de cargo
 * @param {number} id - ID do cargo a ser excluído
 * @type {DELETE} - Método utilizado
 * @returns {void}
 */
export const useDeletePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: positionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
};
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from './useEmployees'
import * as employeeService from '@/services/employeeService'

// Mock do service
vi.mock('@/services/employeeService', () => ({
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
  )
}

describe('useEmployees Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useEmployees', () => {
    it('deve buscar lista de funcionários', async () => {
      const mockData = {
        data: [
          { id: 1, firstName: 'João', lastName: 'Silva', email: 'joao@test.com' }
        ],
        meta: { page: 1, perPage: 10, qtdItens: 1, totalPages: 1 }
      }

      vi.mocked(employeeService.getAll).mockResolvedValue(mockData)

      const { result } = renderHook(() => useEmployees(1, 10), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
      expect(employeeService.getAll).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        search: undefined,
        department: undefined,
        position: undefined,
      })
    })

    it('deve buscar com parâmetros de filtro', async () => {
      const mockData = { data: [], meta: { page: 1, perPage: 10, qtdItens: 0, totalPages: 0 } }
      vi.mocked(employeeService.getAll).mockResolvedValue(mockData)

      const { result } = renderHook(() => useEmployees(1, 10, 'João', 'TI', 'Dev'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(employeeService.getAll).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        search: 'João',
        department: 'TI',
        position: 'Dev',
      })
    })
  })

  describe('useEmployee', () => {
    it('deve buscar funcionário por ID', async () => {
      const mockEmployee = { id: 1, firstName: 'João', lastName: 'Silva' }
      vi.mocked(employeeService.getById).mockResolvedValue(mockEmployee)

      const { result } = renderHook(() => useEmployee(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockEmployee)
      expect(employeeService.getById).toHaveBeenCalledWith(1)
    })
  })

  describe('useCreateEmployee', () => {
    it('deve criar funcionário', async () => {
      const mockEmployee = { id: 1, firstName: 'João', lastName: 'Silva' }
      vi.mocked(employeeService.create).mockResolvedValue(mockEmployee)

      const { result } = renderHook(() => useCreateEmployee(), {
        wrapper: createWrapper(),
      })

      const newEmployee = { firstName: 'João', lastName: 'Silva', email: 'joao@test.com' }

      result.current.mutate(newEmployee)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(employeeService.create).toHaveBeenCalledWith(newEmployee)
    })
  })

  describe('useUpdateEmployee', () => {
    it('deve atualizar funcionário', async () => {
      const mockEmployee = { id: 1, firstName: 'João Atualizado', lastName: 'Silva' }
      vi.mocked(employeeService.update).mockResolvedValue(mockEmployee)

      const { result } = renderHook(() => useUpdateEmployee(), {
        wrapper: createWrapper(),
      })

      const updateData = { firstName: 'João Atualizado' }

      result.current.mutate({ id: 1, data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(employeeService.update).toHaveBeenCalledWith(1, updateData)
    })
  })

  describe('useDeleteEmployee', () => {
    it('deve deletar funcionário', async () => {
      vi.mocked(employeeService.delete).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteEmployee(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(employeeService.delete).toHaveBeenCalledWith(1)
    })
  })
})
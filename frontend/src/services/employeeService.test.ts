import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import * as employeeService from './employeeService'

// Mock do axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('Employee Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('deve buscar todos os funcionários', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, firstName: 'João', lastName: 'Silva' }
          ],
          meta: { page: 1, perPage: 10, qtdItens: 1, totalPages: 1 }
        }
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await employeeService.getAll({
        page: 1,
        perPage: 10
      })

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/employees', {
        params: {
          page: 1,
          perPage: 10,
          search: undefined,
          department: undefined,
          position: undefined
        }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('deve buscar com parâmetros de filtro', async () => {
      const mockResponse = { data: { data: [], meta: {} } }
      mockedAxios.get.mockResolvedValue(mockResponse)

      await employeeService.getAll({
        page: 1,
        perPage: 10,
        search: 'João',
        department: 'TI',
        position: 'Dev'
      })

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/employees', {
        params: {
          page: 1,
          perPage: 10,
          search: 'João',
          department: 'TI',
          position: 'Dev'
        }
      })
    })
  })

  describe('getById', () => {
    it('deve buscar funcionário por ID', async () => {
      const mockEmployee = { id: 1, firstName: 'João', lastName: 'Silva' }
      const mockResponse = { data: mockEmployee }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await employeeService.getById(1)

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/employees/1')
      expect(result).toEqual(mockEmployee)
    })
  })

  describe('create', () => {
    it('deve criar novo funcionário', async () => {
      const newEmployee = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@test.com'
      }
      const mockResponse = { data: { id: 1, ...newEmployee } }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await employeeService.create(newEmployee)

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/employees', newEmployee)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('update', () => {
    it('deve atualizar funcionário existente', async () => {
      const updateData = { firstName: 'João Atualizado' }
      const mockResponse = { data: { id: 1, ...updateData } }

      mockedAxios.put.mockResolvedValue(mockResponse)

      const result = await employeeService.update(1, updateData)

      expect(mockedAxios.put).toHaveBeenCalledWith('/api/employees/1', updateData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('delete', () => {
    it('deve deletar funcionário', async () => {
      mockedAxios.delete.mockResolvedValue({ data: null })

      await employeeService.delete(1)

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/employees/1')
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve tratar erro de rede', async () => {
      const networkError = new Error('Network Error')
      mockedAxios.get.mockRejectedValue(networkError)

      await expect(employeeService.getAll({ page: 1, perPage: 10 }))
        .rejects.toThrow('Network Error')
    })

    it('deve tratar erro 404', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Funcionário não encontrado' }
        }
      }
      mockedAxios.get.mockRejectedValue(notFoundError)

      await expect(employeeService.getById(999))
        .rejects.toEqual(notFoundError)
    })

    it('deve tratar erro de validação', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            errors: {
              email: ['E-mail é obrigatório']
            }
          }
        }
      }
      mockedAxios.post.mockRejectedValue(validationError)

      await expect(employeeService.create({ firstName: 'João' }))
        .rejects.toEqual(validationError)
    })
  })
})
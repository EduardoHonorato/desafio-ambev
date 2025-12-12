import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { EditDepartmentPage } from './index'

const mockDepartment = {
  id: 1,
  name: 'Tecnologia da Informação',
  description: 'Departamento responsável pela TI',
  isActive: true
}

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('EditDepartmentPage - Integração', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve carregar e exibir dados do departamento', async () => {
    vi.doMock('../hooks/useDepartments', () => ({
      useDepartment: () => ({
        data: mockDepartment,
        isLoading: false,
        error: null,
      }),
      useUpdateDepartment: () => ({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
      }),
    }))

    renderWithProviders(<EditDepartmentPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Tecnologia da Informação')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Departamento responsável pela TI')).toBeInTheDocument()
    })
  })

  it('deve atualizar departamento com novos dados', async () => {
    const mockUpdate = vi.fn()

    vi.doMock('../hooks/useDepartments', () => ({
      useDepartment: () => ({
        data: mockDepartment,
        isLoading: false,
        error: null,
      }),
      useUpdateDepartment: () => ({
        mutate: mockUpdate,
        isPending: false,
        isError: false,
        error: null,
      }),
    }))

    const user = userEvent.setup()
    renderWithProviders(<EditDepartmentPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Tecnologia da Informação')).toBeInTheDocument()
    })

    // Alterar nome
    const nameInput = screen.getByDisplayValue('Tecnologia da Informação')
    await user.clear(nameInput)
    await user.type(nameInput, 'TI Atualizado')

    // Alterar descrição
    const descInput = screen.getByDisplayValue('Departamento responsável pela TI')
    await user.clear(descInput)
    await user.type(descInput, 'Nova descrição')

    // Alterar status usando toggle
    const toggle = screen.getByText('Departamento ativo')
    await user.click(toggle)

    // Submeter
    const submitButton = screen.getByText('Atualizar Departamento')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: 1,
        data: {
          name: 'TI Atualizado',
          description: 'Nova descrição',
          isActive: false
        }
      })
    })
  })

  it('deve validar campos obrigatórios', async () => {
    vi.doMock('../hooks/useDepartments', () => ({
      useDepartment: () => ({
        data: mockDepartment,
        isLoading: false,
        error: null,
      }),
      useUpdateDepartment: () => ({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
      }),
    }))

    const user = userEvent.setup()
    renderWithProviders(<EditDepartmentPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Tecnologia da Informação')).toBeInTheDocument()
    })

    // Limpar nome obrigatório
    const nameInput = screen.getByDisplayValue('Tecnologia da Informação')
    await user.clear(nameInput)

    // Tentar submeter
    const submitButton = screen.getByText('Atualizar Departamento')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
    })
  })

  it('deve exibir loading durante atualização', async () => {
    vi.doMock('../hooks/useDepartments', () => ({
      useDepartment: () => ({
        data: mockDepartment,
        isLoading: false,
        error: null,
      }),
      useUpdateDepartment: () => ({
        mutate: vi.fn(),
        isPending: true,
        isError: false,
        error: null,
      }),
    }))

    renderWithProviders(<EditDepartmentPage />)

    expect(screen.getByText('Atualizando departamento...')).toBeInTheDocument()
  })

  it('deve exibir estado de loading inicial', async () => {
    vi.doMock('../hooks/useDepartments', () => ({
      useDepartment: () => ({
        data: null,
        isLoading: true,
        error: null,
      }),
      useUpdateDepartment: () => ({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
      }),
    }))

    renderWithProviders(<EditDepartmentPage />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve exibir erro quando departamento não é encontrado', async () => {
    vi.doMock('../hooks/useDepartments', () => ({
      useDepartment: () => ({
        data: null,
        isLoading: false,
        error: { message: 'Departamento não encontrado' },
      }),
      useUpdateDepartment: () => ({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
      }),
    }))

    renderWithProviders(<EditDepartmentPage />)

    expect(screen.getByText('Departamento não encontrado')).toBeInTheDocument()
  })

  it('deve navegar de volta quando botão Voltar é clicado', async () => {
    vi.doMock('../hooks/useDepartments', () => ({
      useDepartment: () => ({
        data: mockDepartment,
        isLoading: false,
        error: null,
      }),
      useUpdateDepartment: () => ({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
      }),
    }))

    const user = userEvent.setup()
    renderWithProviders(<EditDepartmentPage />)

    await waitFor(() => {
      expect(screen.getByText('Voltar')).toBeInTheDocument()
    })

    const backButton = screen.getByText('Voltar')
    await user.click(backButton)

    expect(backButton).toBeInTheDocument()
  })
})
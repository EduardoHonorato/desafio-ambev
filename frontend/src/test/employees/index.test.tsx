import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import EmployeesPage from './index'

// Mock dos hooks
vi.mock('./hooks/useEmployees', () => ({
  useEmployees: vi.fn(),
  useDeleteEmployee: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { role: 'Director' } })),
}))

const mockEmployees = [
  {
    id: 1,
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao@test.com',
    department: 'TI',
    position: 'Desenvolvedor',
    role: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
]

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

describe('EmployeesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o título da página', async () => {
    const { useEmployees, useDeleteEmployee } = await import('./hooks/useEmployees')
    vi.mocked(useEmployees).mockReturnValue({
      data: { data: mockEmployees, meta: { page: 1, perPage: 10, qtdItens: 1, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeleteEmployee).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    renderWithProviders(<EmployeesPage />)

    expect(screen.getByText('Colaboradores')).toBeInTheDocument()
  })

  it('deve exibir botão de criar colaborador', async () => {
    const { useEmployees, useDeleteEmployee } = await import('./hooks/useEmployees')
    vi.mocked(useEmployees).mockReturnValue({
      data: { data: mockEmployees, meta: { page: 1, perPage: 10, qtdItens: 1, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeleteEmployee).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    renderWithProviders(<EmployeesPage />)

    expect(screen.getByText('Novo Colaborador')).toBeInTheDocument()
  })

  it('deve exibir tabela com colaboradores', async () => {
    const { useEmployees, useDeleteEmployee } = await import('./hooks/useEmployees')
    vi.mocked(useEmployees).mockReturnValue({
      data: { data: mockEmployees, meta: { page: 1, perPage: 10, qtdItens: 1, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeleteEmployee).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    renderWithProviders(<EmployeesPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('joao@test.com')).toBeInTheDocument()
    })
  })

  it('deve permitir busca por colaboradores', async () => {
    const { useEmployees, useDeleteEmployee } = await import('./hooks/useEmployees')
    const mockUseEmployees = vi.mocked(useEmployees)
    mockUseEmployees.mockReturnValue({
      data: { data: mockEmployees, meta: { page: 1, perPage: 10, qtdItens: 1, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeleteEmployee).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    const user = userEvent.setup()
    renderWithProviders(<EmployeesPage />)

    const searchInput = screen.getByPlaceholderText('Buscar colaboradores...')
    await user.type(searchInput, 'João')

    expect(searchInput).toHaveValue('João')
  })

  it('deve exibir estado de loading', async () => {
    const { useEmployees, useDeleteEmployee } = await import('./hooks/useEmployees')
    vi.mocked(useEmployees).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)
    vi.mocked(useDeleteEmployee).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    renderWithProviders(<EmployeesPage />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })
})
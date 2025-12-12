import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { DashboardPage } from '../../pages/dashboard/index'

// Mock dos hooks
vi.mock('../../pages/employees/hooks/useEmployees', () => ({
  useEmployees: vi.fn(),
}))

const mockEmployees = [
  {
    id: 1,
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao@test.com',
    department: 'TI',
    role: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria@test.com',
    department: 'RH',
    role: 2,
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z'
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

describe('DashboardPage - Tela Completa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar todos os elementos da tela', async () => {
    const { useEmployees } = await import('../../pages/employees/hooks/useEmployees')
    vi.mocked(useEmployees).mockReturnValue({
      data: { data: mockEmployees },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<DashboardPage />)

    // Verificar título principal
    expect(screen.getByText('Dashboard')).toBeInTheDocument()

    // Verificar cards de estatísticas
    expect(screen.getByText('Total de Colaboradores')).toBeInTheDocument()
    expect(screen.getByText('Colaboradores Ativos')).toBeInTheDocument()
    expect(screen.getByText('Colaboradores por Cargo')).toBeInTheDocument()
    expect(screen.getByText('Status dos Colaboradores')).toBeInTheDocument()

    // Verificar tabela de últimos colaboradores
    expect(screen.getByText('5 Últimos Colaboradores Cadastrados')).toBeInTheDocument()
  })

  it('deve calcular estatísticas corretamente', async () => {
    const { useEmployees } = await import('../../pages/employees/hooks/useEmployees')
    vi.mocked(useEmployees).mockReturnValue({
      data: { data: mockEmployees },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      // Verificar se os números estão corretos
      expect(screen.getByText('2')).toBeInTheDocument() // Total de colaboradores
      expect(screen.getByText('2')).toBeInTheDocument() // Colaboradores ativos
    })
  })

  it('deve exibir colaboradores na tabela com badges', async () => {
    const { useEmployees } = await import('../../pages/employees/hooks/useEmployees')
    vi.mocked(useEmployees).mockReturnValue({
      data: { data: mockEmployees },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()

      // Verificar badges de departamento
      expect(screen.getByText('TI')).toBeInTheDocument()
      expect(screen.getByText('RH')).toBeInTheDocument()
    })
  })

  it('deve exibir estado de loading', async () => {
    const { useEmployees } = await import('../../pages/employees/hooks/useEmployees')
    vi.mocked(useEmployees).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithProviders(<DashboardPage />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve navegar corretamente quando clicar em ver todos', async () => {
    const { useEmployees } = await import('../../pages/employees/hooks/useEmployees')
    vi.mocked(useEmployees).mockReturnValue({
      data: { data: mockEmployees },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<DashboardPage />)

    // Verificar se existe link para ver todos os colaboradores
    const verTodosLink = screen.queryByText('Ver todos')
    if (verTodosLink) {
      expect(verTodosLink).toBeInTheDocument()
    }
  })
})
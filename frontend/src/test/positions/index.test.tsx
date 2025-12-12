import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import PositionsPage from './index'

// Mock dos hooks
vi.mock('./hooks/usePositions', () => ({
  usePositions: vi.fn(),
  useDeletePosition: vi.fn(),
}))

vi.mock('../departments/hooks/useDepartments', () => ({
  useDepartments: vi.fn(),
}))

const mockPositions = [
  {
    id: 1,
    name: 'Desenvolvedor Full Stack',
    description: 'Desenvolvedor responsável por frontend e backend',
    departmentId: 1,
    departmentName: 'TI',
    isActive: true,
    employeeCount: 3,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Analista de RH',
    description: 'Analista responsável por recrutamento',
    departmentId: 2,
    departmentName: 'Recursos Humanos',
    isActive: false,
    employeeCount: 1,
    createdAt: '2024-01-02T00:00:00Z'
  }
]

const mockDepartments = [
  { id: 1, name: 'TI', isActive: true },
  { id: 2, name: 'Recursos Humanos', isActive: true }
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

describe('PositionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o título da página', async () => {
    const { usePositions, useDeletePosition } = await import('./hooks/usePositions')
    const { useDepartments } = await import('../departments/hooks/useDepartments')

    vi.mocked(usePositions).mockReturnValue({
      data: { data: mockPositions, meta: { page: 1, perPage: 10, qtdItens: 2, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeletePosition).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments },
      isLoading: false,
    } as any)

    renderWithProviders(<PositionsPage />)

    expect(screen.getByText('Cargos')).toBeInTheDocument()
  })

  it('deve exibir botão de criar cargo', async () => {
    const { usePositions, useDeletePosition } = await import('./hooks/usePositions')
    const { useDepartments } = await import('../departments/hooks/useDepartments')

    vi.mocked(usePositions).mockReturnValue({
      data: { data: mockPositions, meta: { page: 1, perPage: 10, qtdItens: 2, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeletePosition).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments },
      isLoading: false,
    } as any)

    renderWithProviders(<PositionsPage />)

    expect(screen.getByText('Novo Cargo')).toBeInTheDocument()
  })

  it('deve exibir tabela com cargos', async () => {
    const { usePositions, useDeletePosition } = await import('./hooks/usePositions')
    const { useDepartments } = await import('../departments/hooks/useDepartments')

    vi.mocked(usePositions).mockReturnValue({
      data: { data: mockPositions, meta: { page: 1, perPage: 10, qtdItens: 2, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeletePosition).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments },
      isLoading: false,
    } as any)

    renderWithProviders(<PositionsPage />)

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Full Stack')).toBeInTheDocument()
      expect(screen.getByText('Analista de RH')).toBeInTheDocument()
    })
  })

  it('deve exibir badges de status corretamente', async () => {
    const { usePositions, useDeletePosition } = await import('./hooks/usePositions')
    const { useDepartments } = await import('../departments/hooks/useDepartments')

    vi.mocked(usePositions).mockReturnValue({
      data: { data: mockPositions, meta: { page: 1, perPage: 10, qtdItens: 2, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeletePosition).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments },
      isLoading: false,
    } as any)

    renderWithProviders(<PositionsPage />)

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Ativo')
      const inactiveBadges = screen.getAllByText('Inativo')

      expect(activeBadges).toHaveLength(1)
      expect(inactiveBadges).toHaveLength(1)
    })
  })

  it('deve permitir filtro por departamento', async () => {
    const { usePositions, useDeletePosition } = await import('./hooks/usePositions')
    const { useDepartments } = await import('../departments/hooks/useDepartments')

    vi.mocked(usePositions).mockReturnValue({
      data: { data: mockPositions, meta: { page: 1, perPage: 10, qtdItens: 2, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeletePosition).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments },
      isLoading: false,
    } as any)

    const user = userEvent.setup()
    renderWithProviders(<PositionsPage />)

    // Verificar se o select de departamento está presente
    await waitFor(() => {
      expect(screen.getByText('Todos os departamentos')).toBeInTheDocument()
    })
  })

  it('deve exibir estado de loading', async () => {
    const { usePositions, useDeletePosition } = await import('./hooks/usePositions')
    const { useDepartments } = await import('../departments/hooks/useDepartments')

    vi.mocked(usePositions).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)
    vi.mocked(useDeletePosition).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments },
      isLoading: false,
    } as any)

    renderWithProviders(<PositionsPage />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })
})
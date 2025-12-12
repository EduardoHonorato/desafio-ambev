import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import DepartmentsPage from './index'

// Mock dos hooks
vi.mock('./hooks/useDepartments', () => ({
  useDepartments: vi.fn(),
  useDeleteDepartment: vi.fn(),
}))

const mockDepartments = [
  {
    id: 1,
    name: 'Tecnologia da Informação',
    description: 'Departamento de TI',
    isActive: true,
    employeeCount: 5,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Recursos Humanos',
    description: 'Departamento de RH',
    isActive: false,
    employeeCount: 3,
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

describe('DepartmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o título da página', async () => {
    const { useDepartments, useDeleteDepartment } = await import('./hooks/useDepartments')
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments, meta: { page: 1, perPage: 10, qtdItens: 2, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeleteDepartment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    renderWithProviders(<DepartmentsPage />)

    expect(screen.getByText('Departamentos')).toBeInTheDocument()
  })

  it('deve exibir botão de criar departamento', async () => {
    const { useDepartments, useDeleteDepartment } = await import('./hooks/useDepartments')
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments, meta: { page: 1, perPage: 10, qtdItens: 2, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeleteDepartment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    renderWithProviders(<DepartmentsPage />)

    expect(screen.getByText('Novo Departamento')).toBeInTheDocument()
  })

  it('deve exibir tabela com departamentos', async () => {
    const { useDepartments, useDeleteDepartment } = await import('./hooks/useDepartments')
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments, meta: { page: 1, perPage: 10, qtdItens: 2, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeleteDepartment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    renderWithProviders(<DepartmentsPage />)

    await waitFor(() => {
      expect(screen.getByText('Tecnologia da Informação')).toBeInTheDocument()
      expect(screen.getByText('Recursos Humanos')).toBeInTheDocument()
    })
  })

  it('deve exibir badges de status corretamente', async () => {
    const { useDepartments, useDeleteDepartment } = await import('./hooks/useDepartments')
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments, meta: { page: 1, perPage: 10, qtdItens: 2, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeleteDepartment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    renderWithProviders(<DepartmentsPage />)

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Ativo')
      const inactiveBadges = screen.getAllByText('Inativo')

      expect(activeBadges).toHaveLength(1)
      expect(inactiveBadges).toHaveLength(1)
    })
  })

  it('deve permitir busca por departamentos', async () => {
    const { useDepartments, useDeleteDepartment } = await import('./hooks/useDepartments')
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments, meta: { page: 1, perPage: 10, qtdItens: 2, totalPages: 1 } },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useDeleteDepartment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    const user = userEvent.setup()
    renderWithProviders(<DepartmentsPage />)

    const searchInput = screen.getByPlaceholderText('Buscar departamentos...')
    await user.type(searchInput, 'TI')

    expect(searchInput).toHaveValue('TI')
  })

  it('deve exibir estado de loading', async () => {
    const { useDepartments, useDeleteDepartment } = await import('./hooks/useDepartments')
    vi.mocked(useDepartments).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)
    vi.mocked(useDeleteDepartment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    renderWithProviders(<DepartmentsPage />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { CreateEmployeePage } from './index'

// Mock dos hooks
vi.mock('../hooks/useEmployees', () => ({
  useCreateEmployee: vi.fn(),
}))

vi.mock('../../departments/hooks/useDepartments', () => ({
  useDepartments: vi.fn(),
}))

vi.mock('../../positions/hooks/usePositions', () => ({
  usePositions: vi.fn(),
}))

const mockDepartments = [
  { id: 1, name: 'TI', isActive: true },
  { id: 2, name: 'RH', isActive: true }
]

const mockPositions = [
  { id: 1, name: 'Desenvolvedor', isActive: true },
  { id: 2, name: 'Analista', isActive: true }
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

describe('CreateEmployeePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o formulário de criação', async () => {
    const { useCreateEmployee } = await import('../hooks/useEmployees')
    const { useDepartments } = await import('../../departments/hooks/useDepartments')
    const { usePositions } = await import('../../positions/hooks/usePositions')

    vi.mocked(useCreateEmployee).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments },
      isLoading: false,
    } as any)
    vi.mocked(usePositions).mockReturnValue({
      data: { data: mockPositions },
      isLoading: false,
    } as any)

    renderWithProviders(<CreateEmployeePage />)

    expect(screen.getByText('Criar Colaborador')).toBeInTheDocument()
    expect(screen.getByLabelText(/Nome/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sobrenome/)).toBeInTheDocument()
    expect(screen.getByLabelText(/E-mail/)).toBeInTheDocument()
  })

  it('deve validar campos obrigatórios', async () => {
    const { useCreateEmployee } = await import('../hooks/useEmployees')
    const { useDepartments } = await import('../../departments/hooks/useDepartments')
    const { usePositions } = await import('../../positions/hooks/usePositions')

    vi.mocked(useCreateEmployee).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments },
      isLoading: false,
    } as any)
    vi.mocked(usePositions).mockReturnValue({
      data: { data: mockPositions },
      isLoading: false,
    } as any)

    const user = userEvent.setup()
    renderWithProviders(<CreateEmployeePage />)

    const submitButton = screen.getByText('Criar Colaborador')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
    })
  })

  it('deve permitir preenchimento do formulário', async () => {
    const { useCreateEmployee } = await import('../hooks/useEmployees')
    const { useDepartments } = await import('../../departments/hooks/useDepartments')
    const { usePositions } = await import('../../positions/hooks/usePositions')

    vi.mocked(useCreateEmployee).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments },
      isLoading: false,
    } as any)
    vi.mocked(usePositions).mockReturnValue({
      data: { data: mockPositions },
      isLoading: false,
    } as any)

    const user = userEvent.setup()
    renderWithProviders(<CreateEmployeePage />)

    const nameInput = screen.getByLabelText(/Nome/)
    const emailInput = screen.getByLabelText(/E-mail/)

    await user.type(nameInput, 'João')
    await user.type(emailInput, 'joao@test.com')

    expect(nameInput).toHaveValue('João')
    expect(emailInput).toHaveValue('joao@test.com')
  })

  it('deve exibir botões de ação', async () => {
    const { useCreateEmployee } = await import('../hooks/useEmployees')
    const { useDepartments } = await import('../../departments/hooks/useDepartments')
    const { usePositions } = await import('../../positions/hooks/usePositions')

    vi.mocked(useCreateEmployee).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useDepartments).mockReturnValue({
      data: { data: mockDepartments },
      isLoading: false,
    } as any)
    vi.mocked(usePositions).mockReturnValue({
      data: { data: mockPositions },
      isLoading: false,
    } as any)

    renderWithProviders(<CreateEmployeePage />)

    expect(screen.getByText('Voltar')).toBeInTheDocument()
    expect(screen.getByText('Criar Colaborador')).toBeInTheDocument()
  })
})
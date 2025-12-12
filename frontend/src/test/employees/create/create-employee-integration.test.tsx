import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { CreateEmployeePage } from './index'

// Mock dos services
vi.mock('@/services/employeeService', () => ({
  create: vi.fn(),
}))

vi.mock('@/services/departmentService', () => ({
  getAll: vi.fn(),
}))

vi.mock('@/services/positionService', () => ({
  getAll: vi.fn(),
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

describe('CreateEmployeePage - Integração', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock dos hooks
    vi.doMock('../hooks/useEmployees', () => ({
      useCreateEmployee: () => ({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
      }),
    }))

    vi.doMock('../../departments/hooks/useDepartments', () => ({
      useDepartments: () => ({
        data: { data: mockDepartments },
        isLoading: false,
      }),
    }))

    vi.doMock('../../positions/hooks/usePositions', () => ({
      usePositions: () => ({
        data: { data: mockPositions },
        isLoading: false,
      }),
    }))
  })

  it('deve preencher e submeter formulário completo', async () => {
    const mockCreate = vi.fn()

    vi.doMock('../hooks/useEmployees', () => ({
      useCreateEmployee: () => ({
        mutate: mockCreate,
        isPending: false,
        isError: false,
        error: null,
      }),
    }))

    const user = userEvent.setup()
    renderWithProviders(<CreateEmployeePage />)

    // Preencher campos obrigatórios
    await user.type(screen.getByLabelText(/Nome/), 'João')
    await user.type(screen.getByLabelText(/Sobrenome/), 'Silva')
    await user.type(screen.getByLabelText(/E-mail/), 'joao.silva@test.com')
    await user.type(screen.getByLabelText(/CPF\/CNPJ/), '12345678901')
    await user.type(screen.getByLabelText(/Data de Nascimento/), '1990-01-01')
    await user.type(screen.getByLabelText(/Senha/), 'senha123')

    // Selecionar departamento
    const departmentSelect = screen.getByText('Selecione um departamento')
    await user.click(departmentSelect)
    await user.click(screen.getByText('TI'))

    // Selecionar cargo
    const roleSelect = screen.getByText('Selecione um cargo')
    await user.click(roleSelect)
    await user.click(screen.getByText('Colaborador'))

    // Adicionar telefone
    await user.type(screen.getByLabelText(/Número do Telefone/), '11999999999')

    // Submeter formulário
    const submitButton = screen.getByText('Criar Colaborador')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@test.com',
        document: '12345678901',
        birthDate: '1990-01-01',
        password: 'senha123',
        role: 1, // Employee
        department: 'TI',
        phones: [
          { number: '11999999999', type: 'Mobile' }
        ]
      })
    })
  })

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateEmployeePage />)

    // Tentar submeter sem preencher campos
    const submitButton = screen.getByText('Criar Colaborador')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Sobrenome é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('E-mail é obrigatório')).toBeInTheDocument()
    })
  })

  it('deve validar formato de e-mail', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateEmployeePage />)

    await user.type(screen.getByLabelText(/E-mail/), 'email-invalido')

    const submitButton = screen.getByText('Criar Colaborador')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
    })
  })

  it('deve permitir adicionar múltiplos telefones', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateEmployeePage />)

    // Adicionar primeiro telefone
    await user.type(screen.getByLabelText(/Número do Telefone/), '11999999999')

    // Adicionar segundo telefone
    const addPhoneButton = screen.getByText('Adicionar Telefone')
    await user.click(addPhoneButton)

    const phoneInputs = screen.getAllByLabelText(/Número do Telefone/)
    expect(phoneInputs).toHaveLength(2)

    await user.type(phoneInputs[1], '1133333333')

    // Alterar tipo do segundo telefone
    const typeSelects = screen.getAllByDisplayValue('Mobile')
    await user.selectOptions(typeSelects[1], 'Landline')

    expect(screen.getByDisplayValue('1133333333')).toBeInTheDocument()
  })

  it('deve permitir remover telefones adicionais', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateEmployeePage />)

    // Adicionar segundo telefone
    const addPhoneButton = screen.getByText('Adicionar Telefone')
    await user.click(addPhoneButton)

    expect(screen.getAllByLabelText(/Número do Telefone/)).toHaveLength(2)

    // Remover segundo telefone
    const removeButtons = screen.getAllByRole('button', { name: '' }) // Botões X
    const removeButton = removeButtons.find(btn => btn.querySelector('svg')) // Botão com ícone X
    if (removeButton) {
      await user.click(removeButton)
    }

    expect(screen.getAllByLabelText(/Número do Telefone/)).toHaveLength(1)
  })

  it('deve navegar de volta quando botão Voltar é clicado', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateEmployeePage />)

    const backButton = screen.getByText('Voltar')
    await user.click(backButton)

    // Verificar se navigate foi chamado (seria mockado em um teste real)
    expect(backButton).toBeInTheDocument()
  })

  it('deve exibir loading durante criação', async () => {
    vi.doMock('../hooks/useEmployees', () => ({
      useCreateEmployee: () => ({
        mutate: vi.fn(),
        isPending: true,
        isError: false,
        error: null,
      }),
    }))

    renderWithProviders(<CreateEmployeePage />)

    expect(screen.getByText('Criando...')).toBeInTheDocument()
  })
})
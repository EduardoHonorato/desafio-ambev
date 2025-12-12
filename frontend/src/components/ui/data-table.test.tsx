import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from './data-table'

const mockHeaders = [
  { key: 'name', title: 'Nome' },
  { key: 'email', title: 'E-mail' },
  { key: 'status', title: 'Status', render: (item: any) => item.isActive ? 'Ativo' : 'Inativo' }
]

const mockItems = [
  { id: 1, name: 'João Silva', email: 'joao@test.com', isActive: true },
  { id: 2, name: 'Maria Santos', email: 'maria@test.com', isActive: false }
]

describe('DataTable Component', () => {
  it('deve renderizar headers corretamente', () => {
    render(
      <DataTable
        headers={mockHeaders}
        items={mockItems}
        currentPage={1}
        totalPages={1}
        onPageChange={() => { }}
      />
    )

    expect(screen.getByText('Nome')).toBeInTheDocument()
    expect(screen.getByText('E-mail')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('deve renderizar items corretamente', () => {
    render(
      <DataTable
        headers={mockHeaders}
        items={mockItems}
        currentPage={1}
        totalPages={1}
        onPageChange={() => { }}
      />
    )

    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('joao@test.com')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    expect(screen.getByText('maria@test.com')).toBeInTheDocument()
  })

  it('deve usar função render personalizada', () => {
    render(
      <DataTable
        headers={mockHeaders}
        items={mockItems}
        currentPage={1}
        totalPages={1}
        onPageChange={() => { }}
      />
    )

    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('deve exibir mensagem quando não há items', () => {
    render(
      <DataTable
        headers={mockHeaders}
        items={[]}
        currentPage={1}
        totalPages={1}
        onPageChange={() => { }}
        emptyMessage="Nenhum item encontrado"
      />
    )

    expect(screen.getByText('Nenhum item encontrado')).toBeInTheDocument()
  })

  it('deve exibir estado de loading', () => {
    render(
      <DataTable
        headers={mockHeaders}
        items={[]}
        currentPage={1}
        totalPages={1}
        onPageChange={() => { }}
        isLoading={true}
      />
    )

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve chamar onPageChange quando página é alterada', async () => {
    const handlePageChange = vi.fn()
    const user = userEvent.setup()

    render(
      <DataTable
        headers={mockHeaders}
        items={mockItems}
        currentPage={1}
        totalPages={3}
        onPageChange={handlePageChange}
      />
    )

    const nextButton = screen.getByText('Próxima')
    await user.click(nextButton)

    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it('deve exibir busca quando searchValue e onSearchChange são fornecidos', () => {
    const handleSearchChange = vi.fn()

    render(
      <DataTable
        headers={mockHeaders}
        items={mockItems}
        currentPage={1}
        totalPages={1}
        onPageChange={() => { }}
        searchValue=""
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar..."
      />
    )

    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })

  it('deve chamar onSearchChange quando busca é alterada', async () => {
    const handleSearchChange = vi.fn()
    const user = userEvent.setup()

    render(
      <DataTable
        headers={mockHeaders}
        items={mockItems}
        currentPage={1}
        totalPages={1}
        onPageChange={() => { }}
        searchValue=""
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar..."
      />
    )

    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'João')

    expect(handleSearchChange).toHaveBeenCalledWith('João')
  })

  it('deve renderizar ações quando fornecidas', () => {
    const mockActions = (item: any) => (
      <button key={item.id}>Editar {item.name}</button>
    )

    render(
      <DataTable
        headers={mockHeaders}
        items={mockItems}
        currentPage={1}
        totalPages={1}
        onPageChange={() => { }}
        actions={mockActions}
      />
    )

    expect(screen.getByText('Editar João Silva')).toBeInTheDocument()
    expect(screen.getByText('Editar Maria Santos')).toBeInTheDocument()
  })
})
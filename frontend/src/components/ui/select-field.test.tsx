import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectField } from './select-field'

const mockOptions = [
  { value: '1', label: 'Opção 1' },
  { value: '2', label: 'Opção 2' },
  { value: '3', label: 'Opção 3' }
]

describe('SelectField Component', () => {
  it('deve renderizar corretamente', () => {
    render(
      <SelectField
        options={mockOptions}
        placeholder="Selecione uma opção"
        value=""
        onChange={() => { }}
      />
    )

    expect(screen.getByText('Selecione uma opção')).toBeInTheDocument()
  })

  it('deve exibir opções quando clicado', async () => {
    const user = userEvent.setup()

    render(
      <SelectField
        options={mockOptions}
        placeholder="Selecione uma opção"
        value=""
        onChange={() => { }}
      />
    )

    const select = screen.getByText('Selecione uma opção')
    await user.click(select)

    expect(screen.getByText('Opção 1')).toBeInTheDocument()
    expect(screen.getByText('Opção 2')).toBeInTheDocument()
    expect(screen.getByText('Opção 3')).toBeInTheDocument()
  })

  it('deve chamar onChange quando opção é selecionada', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(
      <SelectField
        options={mockOptions}
        placeholder="Selecione uma opção"
        value=""
        onChange={handleChange}
      />
    )

    const select = screen.getByText('Selecione uma opção')
    await user.click(select)

    const option = screen.getByText('Opção 1')
    await user.click(option)

    expect(handleChange).toHaveBeenCalledWith('1')
  })

  it('deve exibir valor selecionado', () => {
    render(
      <SelectField
        options={mockOptions}
        placeholder="Selecione uma opção"
        value="2"
        onChange={() => { }}
      />
    )

    expect(screen.getByText('Opção 2')).toBeInTheDocument()
  })

  it('deve estar desabilitado quando disabled=true', () => {
    render(
      <SelectField
        options={mockOptions}
        placeholder="Selecione uma opção"
        value=""
        onChange={() => { }}
        disabled={true}
      />
    )

    const select = screen.getByText('Selecione uma opção')
    expect(select.closest('button')).toBeDisabled()
  })

  it('deve exibir busca quando searchable=true', async () => {
    const user = userEvent.setup()

    render(
      <SelectField
        options={mockOptions}
        placeholder="Selecione uma opção"
        value=""
        onChange={() => { }}
        searchable={true}
      />
    )

    const select = screen.getByText('Selecione uma opção')
    await user.click(select)

    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })

  it('deve filtrar opções quando busca é utilizada', async () => {
    const user = userEvent.setup()

    render(
      <SelectField
        options={mockOptions}
        placeholder="Selecione uma opção"
        value=""
        onChange={() => { }}
        searchable={true}
      />
    )

    const select = screen.getByText('Selecione uma opção')
    await user.click(select)

    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, '1')

    expect(screen.getByText('Opção 1')).toBeInTheDocument()
    expect(screen.queryByText('Opção 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Opção 3')).not.toBeInTheDocument()
  })

  it('deve exibir mensagem quando não há opções', () => {
    render(
      <SelectField
        options={[]}
        placeholder="Selecione uma opção"
        value=""
        onChange={() => { }}
        emptyMessage="Nenhuma opção disponível"
      />
    )

    const select = screen.getByText('Selecione uma opção')
    fireEvent.click(select)

    expect(screen.getByText('Nenhuma opção disponível')).toBeInTheDocument()
  })

  it('deve aplicar className personalizado', () => {
    render(
      <SelectField
        options={mockOptions}
        placeholder="Selecione uma opção"
        value=""
        onChange={() => { }}
        className="custom-class"
      />
    )

    const select = screen.getByText('Selecione uma opção').closest('div')
    expect(select).toHaveClass('custom-class')
  })
})
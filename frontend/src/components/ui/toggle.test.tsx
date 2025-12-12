import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle } from './toggle'

describe('Toggle Component', () => {
  it('deve renderizar corretamente', () => {
    render(<Toggle>Test Toggle</Toggle>)

    expect(screen.getByText('Test Toggle')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('deve estar desmarcado por padrão', () => {
    render(<Toggle>Test Toggle</Toggle>)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('deve estar marcado quando checked=true', () => {
    render(<Toggle checked={true}>Test Toggle</Toggle>)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('deve chamar onCheckedChange quando clicado', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Toggle onCheckedChange={handleChange}>Test Toggle</Toggle>)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('deve estar desabilitado quando disabled=true', () => {
    render(<Toggle disabled={true}>Test Toggle</Toggle>)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('não deve chamar onCheckedChange quando desabilitado', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Toggle disabled={true} onCheckedChange={handleChange}>Test Toggle</Toggle>)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('deve aplicar tamanhos diferentes', () => {
    const { rerender } = render(<Toggle size="sm">Small</Toggle>)
    expect(screen.getByText('Small').parentElement?.querySelector('div')).toHaveClass('w-7')

    rerender(<Toggle size="md">Medium</Toggle>)
    expect(screen.getByText('Medium').parentElement?.querySelector('div')).toHaveClass('w-9')

    rerender(<Toggle size="lg">Large</Toggle>)
    expect(screen.getByText('Large').parentElement?.querySelector('div')).toHaveClass('w-11')
  })

  it('deve aplicar cores diferentes', () => {
    const { rerender } = render(<Toggle color="green">Green</Toggle>)
    expect(screen.getByText('Green').parentElement?.querySelector('div')).toHaveClass('peer-checked:bg-green-600')

    rerender(<Toggle color="red">Red</Toggle>)
    expect(screen.getByText('Red').parentElement?.querySelector('div')).toHaveClass('peer-checked:bg-red-600')

    rerender(<Toggle color="blue">Blue</Toggle>)
    expect(screen.getByText('Blue').parentElement?.querySelector('div')).toHaveClass('peer-checked:bg-blue-600')
  })

  it('deve renderizar sem texto quando children não é fornecido', () => {
    render(<Toggle />)

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.queryByText('Test Toggle')).not.toBeInTheDocument()
  })

  it('deve aplicar className personalizado', () => {
    render(<Toggle className="custom-class">Test</Toggle>)

    expect(screen.getByText('Test').parentElement).toHaveClass('custom-class')
  })
})
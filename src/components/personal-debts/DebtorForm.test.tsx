import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DebtorForm } from './DebtorForm'

describe('DebtorForm', () => {
  it('renders name and notes fields', () => {
    render(<DebtorForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notas/i)).toBeInTheDocument()
  })

  it('shows validation error when submitting empty name', async () => {
    render(<DebtorForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument()
  })

  it('calls onSubmit with trimmed name and null notes when notes empty', async () => {
    const onSubmit = vi.fn()
    render(<DebtorForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/nombre/i), '  María  ')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith({ name: 'María', notes: null })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(<DebtorForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('pre-fills fields when editing an existing debtor', () => {
    render(
      <DebtorForm
        initialValues={{ name: 'María', notes: 'Compañera de trabajo' }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('María')
    expect((screen.getByLabelText(/notas/i) as HTMLInputElement).value).toBe('Compañera de trabajo')
  })
})

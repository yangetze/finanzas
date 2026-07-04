import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IncomeForm } from './IncomeForm'
import type { Wallet, Currency } from '@/types'

const CURRENCIES: Currency[] = [
  { id: 'c1', code: 'USDC', name: 'USD Coin', symbol: '$', type: 'stable', isActive: true, sortOrder: 1, createdAt: '' },
  { id: 'c2', code: 'VES', name: 'Bolívar', symbol: 'Bs', type: 'fiat', isActive: true, sortOrder: 2, createdAt: '' },
]

const WALLETS: Wallet[] = [
  { id: 'w1', userId: 'u1', name: 'Binance', currencyId: 'c1', type: 'asset', creditLimit: null, balance: 100, sortOrder: 1, notes: null, isActive: true, createdAt: '', updatedAt: '' },
]

function setup(onSubmit = vi.fn(), onCancel = vi.fn()) {
  render(
    <IncomeForm
      wallets={WALLETS}
      currencies={CURRENCIES}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />,
  )
  return { onSubmit, onCancel }
}

describe('IncomeForm', () => {
  it('renders fecha, descripción, estado, billetera and monto fields', () => {
    setup()
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/estado/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/billetera/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument()
  })

  it('offers Recibido and Pendiente statuses', () => {
    setup()
    const estado = screen.getByLabelText(/estado/i)
    expect(estado).toContainHTML('Recibido')
    expect(estado).toContainHTML('Pendiente')
  })

  it('requires a description', async () => {
    const { onSubmit } = setup()
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/descripción es requerida/i)).toBeInTheDocument()
  })

  it('submits entered values with wallet and pendiente status', async () => {
    const { onSubmit } = setup()
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Salario')
    await userEvent.type(screen.getByLabelText(/monto/i), '1500')
    await userEvent.selectOptions(screen.getByLabelText(/estado/i), 'pendiente')
    await userEvent.selectOptions(screen.getByLabelText(/billetera/i), 'w1')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Salario',
        amount: 1500,
        status: 'pendiente',
        walletId: 'w1',
        currencyId: 'c1',
      }),
    )
  })

  it('defaults to recibido status and null wallet', async () => {
    const { onSubmit } = setup()
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Freelance')
    await userEvent.type(screen.getByLabelText(/monto/i), '200')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pagado', walletId: null }),
    )
  })
})

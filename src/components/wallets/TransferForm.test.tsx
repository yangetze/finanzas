import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransferForm } from './TransferForm'
import type { Wallet, Currency } from '@/types'

const CURRENCIES: Currency[] = [
  { id: 'c1', code: 'USDC', name: 'USD Coin', symbol: '$', type: 'stable', isActive: true, sortOrder: 1, createdAt: '' },
  { id: 'c2', code: 'USDT', name: 'Tether', symbol: '$', type: 'stable', isActive: true, sortOrder: 2, createdAt: '' },
  { id: 'c3', code: 'VES', name: 'Bolívar', symbol: 'Bs', type: 'fiat', isActive: true, sortOrder: 3, createdAt: '' },
]

const WALLETS: Wallet[] = [
  { id: 'w1', userId: 'u1', name: 'Binance', currencyId: 'c1', type: 'asset', creditLimit: null, balance: 100, sortOrder: 1, notes: null, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'w2', userId: 'u1', name: 'Zinli', currencyId: 'c2', type: 'asset', creditLimit: null, balance: 0, sortOrder: 2, notes: null, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'w3', userId: 'u1', name: 'Banesco', currencyId: 'c3', type: 'asset', creditLimit: null, balance: 0, sortOrder: 3, notes: null, isActive: true, createdAt: '', updatedAt: '' },
]

function setup(onSubmit = vi.fn(), onCancel = vi.fn()) {
  render(
    <TransferForm
      wallets={WALLETS}
      currencies={CURRENCIES}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />,
  )
  return { onSubmit, onCancel }
}

describe('TransferForm', () => {
  it('renders origen, destino, monto enviado, comisión and monto recibido fields', () => {
    setup()
    expect(screen.getByLabelText(/origen/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/destino/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/monto enviado/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/comisión/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/monto recibido/i)).toBeInTheDocument()
  })

  it('requires different origin and destination wallets', async () => {
    const { onSubmit } = setup()
    await userEvent.selectOptions(screen.getByLabelText(/origen/i), 'w1')
    await userEvent.selectOptions(screen.getByLabelText(/destino/i), 'w1')
    await userEvent.type(screen.getByLabelText(/monto enviado/i), '70')
    await userEvent.click(screen.getByRole('button', { name: /transferir/i }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/distinta/i)).toBeInTheDocument()
  })

  it('requires a positive amount sent', async () => {
    const { onSubmit } = setup()
    await userEvent.selectOptions(screen.getByLabelText(/origen/i), 'w1')
    await userEvent.selectOptions(screen.getByLabelText(/destino/i), 'w2')
    await userEvent.click(screen.getByRole('button', { name: /transferir/i }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('pre-fills monto recibido as enviado minus comisión for stable/USD pairs', async () => {
    setup()
    await userEvent.selectOptions(screen.getByLabelText(/origen/i), 'w1')
    await userEvent.selectOptions(screen.getByLabelText(/destino/i), 'w2')
    await userEvent.type(screen.getByLabelText(/monto enviado/i), '70')
    await userEvent.type(screen.getByLabelText(/comisión/i), '5')
    expect((screen.getByLabelText(/monto recibido/i) as HTMLInputElement).value).toBe('65')
  })

  it('does not auto-fill monto recibido when destination currency is fiat', async () => {
    setup()
    await userEvent.selectOptions(screen.getByLabelText(/origen/i), 'w1')
    await userEvent.selectOptions(screen.getByLabelText(/destino/i), 'w3')
    await userEvent.type(screen.getByLabelText(/monto enviado/i), '70')
    expect((screen.getByLabelText(/monto recibido/i) as HTMLInputElement).value).toBe('')
  })

  it('submits full transfer values', async () => {
    const { onSubmit } = setup()
    await userEvent.selectOptions(screen.getByLabelText(/origen/i), 'w1')
    await userEvent.selectOptions(screen.getByLabelText(/destino/i), 'w3')
    await userEvent.type(screen.getByLabelText(/monto enviado/i), '70')
    await userEvent.type(screen.getByLabelText(/comisión/i), '5')
    await userEvent.type(screen.getByLabelText(/monto recibido/i), '2400')
    await userEvent.click(screen.getByRole('button', { name: /transferir/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        fromWalletId: 'w1',
        toWalletId: 'w3',
        fromCurrencyId: 'c1',
        toCurrencyId: 'c3',
        amountSent: 70,
        commission: 5,
        amountReceived: 2400,
      }),
    )
  })

  it('defaults commission to 0 when left empty', async () => {
    const { onSubmit } = setup()
    await userEvent.selectOptions(screen.getByLabelText(/origen/i), 'w1')
    await userEvent.selectOptions(screen.getByLabelText(/destino/i), 'w2')
    await userEvent.type(screen.getByLabelText(/monto enviado/i), '50')
    await userEvent.click(screen.getByRole('button', { name: /transferir/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ commission: 0, amountReceived: 50 }),
    )
  })
})

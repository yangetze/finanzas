import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SavingsByWalletSummary } from './SavingsByWalletSummary'
import type { SavingsByWalletRow } from '@/lib/savingsByWallet'

const CURRENCIES = [{ id: 'usdt', symbol: '$' }]

describe('SavingsByWalletSummary', () => {
  it('renders nothing when there are no rows', () => {
    const { container } = render(<SavingsByWalletSummary rows={[]} currencies={CURRENCIES} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows planned vs actual per wallet', () => {
    const rows: SavingsByWalletRow[] = [
      { walletId: 'w1', walletName: 'Bitget Earn USDt', currencyId: 'usdt', planned: 150, actual: 150 },
    ]
    render(<SavingsByWalletSummary rows={rows} currencies={CURRENCIES} />)
    expect(screen.getByText('Bitget Earn USDt')).toBeInTheDocument()
    expect(screen.getAllByText(/\$ 150,00/)).toHaveLength(2)
  })

  it('flags a mismatch between planned and real balance', () => {
    const rows: SavingsByWalletRow[] = [
      { walletId: 'w2', walletName: 'Belo', currencyId: 'usdt', planned: 30, actual: 80 },
    ]
    render(<SavingsByWalletSummary rows={rows} currencies={CURRENCIES} />)
    expect(screen.getByText(/revisar/i)).toBeInTheDocument()
  })

  it('does not flag a mismatch when planned matches actual', () => {
    const rows: SavingsByWalletRow[] = [
      { walletId: 'w1', walletName: 'Bitget Earn USDt', currencyId: 'usdt', planned: 150, actual: 150 },
    ]
    render(<SavingsByWalletSummary rows={rows} currencies={CURRENCIES} />)
    expect(screen.queryByText(/revisar/i)).not.toBeInTheDocument()
  })
})

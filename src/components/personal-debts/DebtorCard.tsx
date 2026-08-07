import { useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Plus, PowerOff, Scale } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PersonalDebtRow } from '@/components/personal-debts/PersonalDebtRow'
import { outstandingAmount, netTotalsInUsdc, type PersonalDebtCurrencyTotal } from '@/lib/personalDebtTotals'
import { formatCurrencyWithCode } from '@/lib/utils'
import type { RateRow } from '@/lib/emergencyFund'
import type { Debtor, PersonalDebt, PersonalDebtPayment, Currency, Wallet } from '@/types'

interface DebtorCardProps {
  debtor: Debtor
  debts: PersonalDebt[]
  payments: PersonalDebtPayment[]
  netTotals: PersonalDebtCurrencyTotal[]
  currencies: Currency[]
  rates: RateRow[]
  wallets: Wallet[]
  onEdit: (debtor: Debtor) => void
  onDeactivate: (id: string) => void
  onAddDebt: (debtor: Debtor) => void
  onOffset: (debtor: Debtor) => void
  onAddPayment: (debt: PersonalDebt) => void
  onDeleteDebt: (debt: PersonalDebt) => void
  onDeletePayment: (payment: PersonalDebtPayment) => void
}

export function DebtorCard({
  debtor,
  debts,
  payments,
  netTotals,
  currencies,
  rates,
  wallets,
  onEdit,
  onDeactivate,
  onAddDebt,
  onOffset,
  onAddPayment,
  onDeleteDebt,
  onDeletePayment,
}: DebtorCardProps) {
  const [expanded, setExpanded] = useState(false)

  function currencyOf(currencyId: string) {
    return currencies.find((c) => c.id === currencyId)
  }

  const usdcCurrency = currencies.find((c) => c.code === 'USDC')
  const { usdcTotal, unconverted, indexed } = netTotalsInUsdc(netTotals, currencies, rates)

  const canOffset =
    debts.some((d) => d.direction === 'they_owe_me' && d.status !== 'paid') &&
    debts.some((d) => d.direction === 'i_owe_them' && d.status !== 'paid')

  return (
    <Card padding="none" className="flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-ink-faint shrink-0"
          aria-label={expanded ? 'Contraer' : 'Expandir'}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <span className="text-base font-ui font-semibold text-ink">{debtor.name}</span>
          {netTotals.length === 0 ? (
            <p className="text-xs font-ui text-ink-faint">Sin saldo pendiente</p>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {usdcCurrency && usdcTotal !== null && usdcTotal !== 0 && (
                <span className={`text-sm font-mono ${usdcTotal > 0 ? 'text-sage' : 'text-coral'}`}>
                  {usdcTotal > 0 ? 'Me debe' : 'Le debo'} {formatCurrencyWithCode(Math.abs(usdcTotal), usdcCurrency)}
                </span>
              )}
              {unconverted.map(({ currencyId, total }) => {
                const currency = currencyOf(currencyId)
                if (!currency) return null
                return (
                  <span
                    key={currencyId}
                    className={`text-sm font-mono ${total > 0 ? 'text-sage' : 'text-coral'}`}
                  >
                    {total > 0 ? 'Me debe' : 'Le debo'} {formatCurrencyWithCode(Math.abs(total), currency)}
                  </span>
                )
              })}
              {indexed.map(({ currencyId, total, indexCurrencyId }, idx) => {
                const currency = currencyOf(currencyId)
                const indexCurrency = currencyOf(indexCurrencyId)
                if (!currency) return null
                return (
                  <span
                    key={`indexed-${currencyId}-${idx}`}
                    className={`text-sm font-mono ${total > 0 ? 'text-sage' : 'text-coral'}`}
                  >
                    {total > 0 ? 'Me debe' : 'Le debo'} {formatCurrencyWithCode(Math.abs(total), currency)}
                    {indexCurrency && (
                      <span className="text-xs text-ink-faint"> (indexado a {indexCurrency.code})</span>
                    )}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex gap-1.5 shrink-0">
          {canOffset && (
            <Button variant="ghost" size="sm" onClick={() => onOffset(debtor)} aria-label="Compensar">
              <Scale size={14} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onAddDebt(debtor)} aria-label="Agregar deuda">
            <Plus size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(debtor)} aria-label="Editar">
            <Pencil size={14} />
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDeactivate(debtor.id)} aria-label="Desactivar">
            <PowerOff size={14} />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border flex flex-col">
          {debts.length === 0 ? (
            <p className="text-xs font-ui text-ink-faint px-4 py-3">Sin deudas registradas</p>
          ) : (
            debts.map((debt, idx) => {
              const currency = currencyOf(debt.currencyId)
              if (!currency) return null
              const indexCurrency = debt.indexCurrencyId ? currencyOf(debt.indexCurrencyId) : null
              const debtPayments = payments.filter((p) => p.personalDebtId === debt.id)
              return (
                <div key={debt.id} className={idx > 0 ? 'border-t border-border' : ''}>
                  <PersonalDebtRow
                    debt={debt}
                    currency={currency}
                    indexCurrency={indexCurrency}
                    outstanding={outstandingAmount(debt, debtPayments)}
                    payments={debtPayments}
                    wallets={wallets}
                    onAddPayment={onAddPayment}
                    onDelete={onDeleteDebt}
                    onDeletePayment={onDeletePayment}
                  />
                </div>
              )
            })
          )}
        </div>
      )}
    </Card>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWallets, usePayCreditCardBalance } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { useExchangeRates } from '@/hooks/useExchangeRates'
import { useDebtors, useCreateDebtor, useUpdateDebtor, useDeactivateDebtor } from '@/hooks/useDebtors'
import { usePersonalDebts, useCreatePersonalDebt, useDeletePersonalDebt } from '@/hooks/usePersonalDebts'
import {
  usePersonalDebtPaymentsForUser,
  useAddPersonalDebtPayment,
  useDeletePersonalDebtPayment,
  useCreatePersonalDebtOffset,
  useDeletePersonalDebtOffset,
} from '@/hooks/usePersonalDebtPayments'
import { TDCCard } from '@/components/debts/TDCCard'
import { PayCreditCardForm } from '@/components/debts/PayCreditCardForm'
import { DebtorCard } from '@/components/personal-debts/DebtorCard'
import { DebtorForm } from '@/components/personal-debts/DebtorForm'
import { PersonalDebtForm } from '@/components/personal-debts/PersonalDebtForm'
import { PersonalDebtPaymentForm } from '@/components/personal-debts/PersonalDebtPaymentForm'
import { PersonalDebtOffsetForm } from '@/components/personal-debts/PersonalDebtOffsetForm'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ScrollAnchor } from '@/components/ui/ScrollAnchor'
import { netByDebtor, outstandingAmount } from '@/lib/personalDebtTotals'
import type { Debtor, PersonalDebt, PersonalDebtPayment, Wallet } from '@/types'

type Tab = 'tdc' | 'personas'

export function DebtsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('tdc')

  const { data: wallets, isLoading: walletsLoading } = useWallets(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()
  const { data: rates } = useExchangeRates()
  const { data: debtors, isLoading: debtorsLoading } = useDebtors(user?.id)
  const { data: debts, isLoading: debtsLoading } = usePersonalDebts(user?.id)
  const { data: payments, isLoading: paymentsLoading } = usePersonalDebtPaymentsForUser(user?.id)

  const createDebtor = useCreateDebtor()
  const updateDebtor = useUpdateDebtor()
  const deactivateDebtor = useDeactivateDebtor()
  const createPersonalDebt = useCreatePersonalDebt()
  const deletePersonalDebt = useDeletePersonalDebt()
  const addPersonalDebtPayment = useAddPersonalDebtPayment()
  const deletePersonalDebtPayment = useDeletePersonalDebtPayment()
  const createPersonalDebtOffset = useCreatePersonalDebtOffset()
  const deletePersonalDebtOffset = useDeletePersonalDebtOffset()
  const payCreditCardBalance = usePayCreditCardBalance()

  const [showDebtorForm, setShowDebtorForm] = useState(false)
  const [editingDebtor, setEditingDebtor] = useState<Debtor | null>(null)
  const [debtorForDebt, setDebtorForDebt] = useState<Debtor | null>(null)
  const [debtForPayment, setDebtForPayment] = useState<PersonalDebt | null>(null)
  const [debtorForOffset, setDebtorForOffset] = useState<Debtor | null>(null)
  const [cardForPayment, setCardForPayment] = useState<Wallet | null>(null)

  const isLoading = walletsLoading || currenciesLoading
  const isPersonasLoading = debtorsLoading || debtsLoading || paymentsLoading || currenciesLoading

  const creditWallets = wallets?.filter((w) => w.type === 'credit') ?? []

  function getCurrency(currencyId: string) {
    return currencies?.find((c) => c.id === currencyId)
  }

  function closeAllForms() {
    setShowDebtorForm(false)
    setEditingDebtor(null)
    setDebtorForDebt(null)
    setDebtForPayment(null)
    setDebtorForOffset(null)
    setCardForPayment(null)
  }

  function handlePayCreditCardSubmit(values: {
    walletId: string
    amount: number
    paymentCurrencyId: string
    paymentAmount: number
    conversionRate: number | null
  }) {
    if (!cardForPayment) return
    payCreditCardBalance.mutate(
      {
        creditWalletId: cardForPayment.id,
        amount: values.amount,
        sourceWalletId: values.walletId,
        paymentAmount: values.paymentAmount,
      },
      { onSuccess: closeAllForms },
    )
  }

  function handleDebtorSubmit(values: { name: string; notes: string | null }) {
    if (editingDebtor) {
      updateDebtor.mutate({ id: editingDebtor.id, data: values }, { onSuccess: closeAllForms })
    } else {
      createDebtor.mutate({ userId: user!.id, ...values }, { onSuccess: closeAllForms })
    }
  }

  function handleDebtSubmit(values: {
    direction: PersonalDebt['direction']
    description: string
    currencyId: string
    originalAmount: number
    date: string
    isIndexed: boolean
    notes: string | null
  }) {
    if (!debtorForDebt) return
    createPersonalDebt.mutate(
      { userId: user!.id, debtorId: debtorForDebt.id, ...values },
      { onSuccess: closeAllForms },
    )
  }

  function handlePaymentSubmit(values: {
    walletId: string
    amount: number
    paymentCurrencyId: string
    paymentAmount: number
    conversionRate: number | null
    date: string
    notes: string | null
  }) {
    if (!debtForPayment) return
    addPersonalDebtPayment.mutate(
      {
        userId: user!.id,
        personalDebtId: debtForPayment.id,
        debtDirection: debtForPayment.direction,
        debtOriginalAmount: debtForPayment.originalAmount,
        currencyId: debtForPayment.currencyId,
        ...values,
      },
      { onSuccess: closeAllForms },
    )
  }

  function handleDeleteDebt(debt: PersonalDebt) {
    deletePersonalDebt.mutate(debt.id)
  }

  function handleDeletePayment(payment: PersonalDebtPayment) {
    if (payment.paymentType === 'offset' && payment.offsetGroupId) {
      const debtIds = [
        ...new Set((payments ?? []).filter((p) => p.offsetGroupId === payment.offsetGroupId).map((p) => p.personalDebtId)),
      ]
      const affectedDebts = debtIds
        .map((id) => debts?.find((d) => d.id === id))
        .filter((d): d is PersonalDebt => !!d)
        .map((d) => ({ id: d.id, originalAmount: d.originalAmount }))
      deletePersonalDebtOffset.mutate({ offsetGroupId: payment.offsetGroupId, debts: affectedDebts })
      return
    }
    const debt = debts?.find((d) => d.id === payment.personalDebtId)
    if (!debt || !payment.walletId) return
    deletePersonalDebtPayment.mutate({
      id: payment.id,
      personalDebtId: payment.personalDebtId,
      debtDirection: debt.direction,
      debtOriginalAmount: debt.originalAmount,
      walletId: payment.walletId,
      paymentAmount: payment.paymentAmount,
    })
  }

  function handleOffsetSubmit(values: {
    theyOweMeDebtId: string
    iOweThemDebtId: string
    amount: number
    currencyId: string
    date: string
  }) {
    const debtA = debts?.find((d) => d.id === values.theyOweMeDebtId)
    const debtB = debts?.find((d) => d.id === values.iOweThemDebtId)
    if (!debtA || !debtB) return
    createPersonalDebtOffset.mutate(
      {
        userId: user!.id,
        debtAId: debtA.id,
        debtAOriginalAmount: debtA.originalAmount,
        debtBId: debtB.id,
        debtBOriginalAmount: debtB.originalAmount,
        amount: values.amount,
        currencyId: values.currencyId,
        date: values.date,
      },
      { onSuccess: closeAllForms },
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner />
      </div>
    )
  }

  const offsetDebtor = debtorForOffset
  const offsetDebts = offsetDebtor ? (debts ?? []).filter((d) => d.debtorId === offsetDebtor.id) : []
  const theyOweMeDebts = offsetDebts
    .filter((d) => d.direction === 'they_owe_me' && d.status !== 'paid')
    .map((d) => ({ ...d, outstanding: outstandingAmount(d, payments ?? []) }))
  const iOweThemDebts = offsetDebts
    .filter((d) => d.direction === 'i_owe_them' && d.status !== 'paid')
    .map((d) => ({ ...d, outstanding: outstandingAmount(d, payments ?? []) }))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-ui font-semibold text-ink">Deudas</h1>

      <div className="flex gap-1 border-b border-border">
        {(['tdc', 'personas'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-ui transition-colors ${
              tab === t ? 'text-ink border-b-2 border-gold -mb-px' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {t === 'tdc' ? 'TDC' : 'Personas'}
          </button>
        ))}
      </div>

      {tab === 'tdc' && (
        <>
          {creditWallets.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-48 text-center gap-2">
              <p className="text-3xl">💳</p>
              <p className="text-ink-muted font-ui text-sm">No tienes tarjetas de crédito registradas</p>
              <Link
                to="/billeteras"
                className="text-sm font-ui text-gold hover:text-gold/80 inline-flex items-center gap-1 mt-1"
              >
                Agregar tarjeta <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {cardForPayment &&
            (() => {
              const currency = getCurrency(cardForPayment.currencyId)
              const assetWallets = (wallets ?? []).filter((w) => w.type === 'asset')
              if (!currency) return null
              return (
                <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
                  <ScrollAnchor />
                  <h2 className="text-base font-ui font-semibold text-ink mb-4">
                    Pagar {cardForPayment.name}
                  </h2>
                  <PayCreditCardForm
                    wallets={assetWallets}
                    currencies={currencies ?? []}
                    currency={currency}
                    outstanding={cardForPayment.balance}
                    onSubmit={handlePayCreditCardSubmit}
                    onCancel={closeAllForms}
                    loading={payCreditCardBalance.isPending}
                  />
                </div>
              )
            })()}

          {creditWallets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {creditWallets.map((wallet) => {
                const currency = getCurrency(wallet.currencyId)
                if (!currency) return null
                return (
                  <TDCCard
                    key={wallet.id}
                    wallet={wallet}
                    currency={currency}
                    onPay={(w) => setCardForPayment(w)}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'personas' && (
        <>
          {isPersonasLoading ? (
            <div className="flex items-center justify-center min-h-48">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setShowDebtorForm(true)}>
                  <Plus size={16} />
                  Nuevo deudor
                </Button>
              </div>

              {showDebtorForm && (
                <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
                  <ScrollAnchor />
                  <h2 className="text-base font-ui font-semibold text-ink mb-4">
                    {editingDebtor ? 'Editar deudor' : 'Nuevo deudor'}
                  </h2>
                  <DebtorForm
                    initialValues={editingDebtor ?? undefined}
                    onSubmit={handleDebtorSubmit}
                    onCancel={closeAllForms}
                    loading={createDebtor.isPending || updateDebtor.isPending}
                  />
                </div>
              )}

              {debtorForDebt && currencies && (
                <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
                  <ScrollAnchor />
                  <h2 className="text-base font-ui font-semibold text-ink mb-4">
                    Nueva deuda con {debtorForDebt.name}
                  </h2>
                  <PersonalDebtForm
                    currencies={currencies}
                    onSubmit={handleDebtSubmit}
                    onCancel={closeAllForms}
                    loading={createPersonalDebt.isPending}
                  />
                </div>
              )}

              {debtForPayment &&
                (() => {
                  const currency = getCurrency(debtForPayment.currencyId)
                  if (!currency) return null
                  return (
                    <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
                      <ScrollAnchor />
                      <h2 className="text-base font-ui font-semibold text-ink mb-4">
                        Registrar pago — {debtForPayment.description}
                      </h2>
                      <PersonalDebtPaymentForm
                        wallets={wallets ?? []}
                        currencies={currencies ?? []}
                        currency={currency}
                        outstanding={outstandingAmount(debtForPayment, payments ?? [])}
                        isIndexed={debtForPayment.isIndexed}
                        onSubmit={handlePaymentSubmit}
                        onCancel={closeAllForms}
                        loading={addPersonalDebtPayment.isPending}
                      />
                    </div>
                  )
                })()}

              {offsetDebtor && currencies && (
                <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
                  <ScrollAnchor />
                  <h2 className="text-base font-ui font-semibold text-ink mb-4">
                    Compensar deudas con {offsetDebtor.name}
                  </h2>
                  <PersonalDebtOffsetForm
                    theyOweMeDebts={theyOweMeDebts}
                    iOweThemDebts={iOweThemDebts}
                    currencies={currencies}
                    onSubmit={handleOffsetSubmit}
                    onCancel={closeAllForms}
                    loading={createPersonalDebtOffset.isPending}
                  />
                </div>
              )}

              {debtors && debtors.length === 0 && !showDebtorForm && (
                <div className="flex flex-col items-center justify-center min-h-48 text-center gap-2">
                  <p className="text-3xl">🤝</p>
                  <p className="text-ink-muted font-ui">Aún no tienes deudores registrados</p>
                  <Button size="sm" variant="ghost" onClick={() => setShowDebtorForm(true)}>
                    Crear primer deudor
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {debtors?.map((debtor) => {
                  const debtorDebts = (debts ?? []).filter((d) => d.debtorId === debtor.id)
                  return (
                    <DebtorCard
                      key={debtor.id}
                      debtor={debtor}
                      debts={debtorDebts}
                      payments={payments ?? []}
                      netTotals={netByDebtor(debtorDebts, payments ?? [])}
                      currencies={currencies ?? []}
                      rates={rates ?? []}
                      wallets={wallets ?? []}
                      onEdit={(d) => {
                        setEditingDebtor(d)
                        setShowDebtorForm(true)
                      }}
                      onDeactivate={(id) => deactivateDebtor.mutate(id)}
                      onAddDebt={(d) => setDebtorForDebt(d)}
                      onOffset={(d) => setDebtorForOffset(d)}
                      onAddPayment={(debt) => setDebtForPayment(debt)}
                      onDeleteDebt={handleDeleteDebt}
                      onDeletePayment={handleDeletePayment}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

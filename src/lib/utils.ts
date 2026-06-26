import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(
  amount: number,
  symbol: string,
  decimals = 2,
): string {
  return `${symbol}${amount.toLocaleString('es-VE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM yyyy', { locale: es })
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM', { locale: es })
}

export function calcBaseAmount(
  paymentAmount: number,
  baseRate: number | null,
): number {
  if (baseRate === null) return paymentAmount
  return paymentAmount / baseRate
}

export function calcConvertedAmount(
  originAmount: number,
  conversionRate: number | null,
): number {
  if (conversionRate === null) return originAmount
  return originAmount * conversionRate
}

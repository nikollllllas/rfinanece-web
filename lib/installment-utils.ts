/** Max parcels selectable in UI / API (inclusive). */
export const INSTALLMENT_MAX = 12

/** Min parcels for split credit purchase (inclusive). */
export const INSTALLMENT_MIN_SPLIT = 2

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "Pix",
  DEBITO: "Débito",
  CREDITO: "Crédito",
}

export const getPaymentMethodLabel = (method: string | null | undefined): string | null => {
  if (!method) {
    return null
  }
  return PAYMENT_METHOD_LABELS[method] ?? null
}

export const getInstallmentSuffix = (
  index: number | null | undefined,
  count: number | null | undefined,
): string | null => {
  if (index == null || count == null || count < INSTALLMENT_MIN_SPLIT) {
    return null
  }
  return `(${index}/${count})`
}

/**
 * Split a total BRL amount into N installment amounts in reais.
 * Uses cent rounding; last installment absorbs remainder so the sum equals the total.
 */
export const splitInstallmentAmounts = (total: number, count: number): number[] => {
  if (count < 1 || !Number.isFinite(total)) {
    return []
  }

  const totalCents = Math.round(total * 100)
  const baseCents = Math.floor(totalCents / count)
  const amounts: number[] = []

  for (let i = 0; i < count - 1; i++) {
    amounts.push(baseCents / 100)
  }

  amounts.push((totalCents - baseCents * (count - 1)) / 100)
  return amounts
}

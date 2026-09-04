export const money = (value:number) => new Intl.NumberFormat('es-PY', {
  style:'currency', currency:'PYG', maximumFractionDigits:0
}).format(value)
export function calculateQuote(subtotal:number, ivaRate:number, discountPct:number) {
  const iva = Math.round(subtotal * ivaRate / 100)
  const gross = subtotal + iva
  const discount = Math.round(gross * discountPct / 100)
  return { subtotal, iva, gross, discount, total: gross-discount }
}

export const MAX_QUANTITY = 99
export function quantity(value, fallback = 1) {
  const number = Number(value)
  return String(value).trim() && Number.isInteger(number) && number > 0
    ? Math.min(MAX_QUANTITY, number)
    : fallback
}
export const money = (cents) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100,
  )
export const itemCount = (cart) =>
  cart.reduce((sum, item) => sum + item.quantity, 0)
export const cartTotal = (cart) =>
  cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)
export function addItem(cart, product, amount) {
  const existing = cart.find((item) => item.id === product.id)
  return existing
    ? cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: quantity(item.quantity + quantity(amount)) }
          : item,
      )
    : [...cart, { ...product, quantity: quantity(amount) }]
}

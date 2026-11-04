// Shared data + formatting for the cart exercise.
export type Product = {
  id: string
  name: string
  price: number
}

export const PRODUCTS: Product[] = [
  { id: 'kb', name: 'Keyboard', price: 49.99 },
  { id: 'mouse', name: 'Mouse', price: 19.5 },
  { id: 'monitor', name: 'Monitor', price: 189 },
]

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatPrice(amount: number) {
  return currency.format(amount)
}

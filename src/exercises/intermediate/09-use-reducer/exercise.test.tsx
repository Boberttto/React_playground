import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExerciseDemo, { cartReducer, getCartTotals, initialCart, type CartAction, type CartState } from './Exercise'

const keyboard = { id: 'kb', name: 'Keyboard', price: 50 }
const mouse = { id: 'mouse', name: 'Mouse', price: 20 }

// Deep-freeze so any mutation inside the reducer throws in strict-mode JS.
function frozen(state: CartState): CartState {
  state.items.forEach((item) => Object.freeze(item))
  Object.freeze(state.items)
  return Object.freeze(state)
}

function reduce(actions: CartAction[], start: CartState = initialCart) {
  return actions.reduce((state, action) => cartReducer(frozen(state), action), start)
}

describe('09 – cartReducer (pure unit tests)', () => {
  it('adds a new product with quantity 1', () => {
    const state = reduce([{ type: 'added', product: keyboard }])
    expect(state.items).toEqual([{ ...keyboard, quantity: 1 }])
  })

  it('increments the quantity when the product is already in the cart', () => {
    const state = reduce([
      { type: 'added', product: keyboard },
      { type: 'added', product: keyboard },
    ])
    expect(state.items).toEqual([{ ...keyboard, quantity: 2 }])
  })

  it('removes an item', () => {
    const state = reduce([
      { type: 'added', product: keyboard },
      { type: 'added', product: mouse },
      { type: 'removed', id: 'kb' },
    ])
    expect(state.items.map((i) => i.id)).toEqual(['mouse'])
  })

  it('changes the quantity, and removes the item when it drops to 0', () => {
    let state = reduce([
      { type: 'added', product: keyboard },
      { type: 'quantity_changed', id: 'kb', quantity: 5 },
    ])
    expect(state.items[0].quantity).toBe(5)

    state = reduce([{ type: 'quantity_changed', id: 'kb', quantity: 0 }], state)
    expect(state.items).toEqual([])
  })

  it('clears the cart', () => {
    const state = reduce([
      { type: 'added', product: keyboard },
      { type: 'added', product: mouse },
      { type: 'cleared' },
    ])
    expect(state.items).toEqual([])
  })

  it('never mutates the previous state', () => {
    const before = frozen({ items: [{ ...keyboard, quantity: 1 }] })
    const after = cartReducer(before, { type: 'added', product: keyboard })
    expect(after).not.toBe(before)
    expect(before.items[0].quantity).toBe(1)
  })
})

describe('09 – getCartTotals', () => {
  it('derives item count and total price', () => {
    expect(
      getCartTotals([
        { ...keyboard, quantity: 2 },
        { ...mouse, quantity: 3 },
      ]),
    ).toEqual({ count: 5, total: 160 })
  })

  it('returns zeros for an empty cart', () => {
    expect(getCartTotals([])).toEqual({ count: 0, total: 0 })
  })
})

describe('09 – cart UI', () => {
  it('adds products and shows derived totals', async () => {
    const user = userEvent.setup()
    render(<ExerciseDemo />)
    await user.click(screen.getByRole('button', { name: 'Add Keyboard to cart' }))
    await user.click(screen.getByRole('button', { name: 'Add Keyboard to cart' }))
    await user.click(screen.getByRole('button', { name: 'Add Mouse to cart' }))

    expect(screen.getByRole('spinbutton', { name: 'Quantity of Keyboard' })).toHaveValue(2)
    expect(screen.getByText('Items: 3')).toBeInTheDocument()
    expect(screen.getByText('Total: $119.48')).toBeInTheDocument()
  })

  it('changes quantity and removes items', async () => {
    const user = userEvent.setup()
    render(<ExerciseDemo />)
    await user.click(screen.getByRole('button', { name: 'Add Monitor to cart' }))
    await user.click(screen.getByRole('button', { name: 'Add Mouse to cart' }))

    const qty = screen.getByRole('spinbutton', { name: 'Quantity of Monitor' })
    // The field already contains "1": typing "0" after it makes it 10.
    await user.type(qty, '0')
    expect(qty).toHaveValue(10)
    expect(screen.getByText('Items: 11')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove Monitor' }))
    expect(screen.queryByRole('spinbutton', { name: 'Quantity of Monitor' })).not.toBeInTheDocument()
    expect(screen.getByText('Total: $19.50')).toBeInTheDocument()
  })

  it('clears the cart', async () => {
    const user = userEvent.setup()
    render(<ExerciseDemo />)
    await user.click(screen.getByRole('button', { name: 'Add Mouse to cart' }))
    await user.click(screen.getByRole('button', { name: 'Clear cart' }))
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
    expect(screen.getByText('Items: 0')).toBeInTheDocument()
  })
})

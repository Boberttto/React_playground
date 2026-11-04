// Tests import the reducer from this file, so it exports non-components on purpose.
// oxlint-disable react/only-export-components
import { useReducer } from 'react'
import { PRODUCTS, formatPrice, type Product } from './catalog'
import styles from './styles.module.scss'

export type CartItem = Product & { quantity: number }
export type CartState = { items: CartItem[] }

// A discriminated union: `type` is the discriminant, so inside `case 'removed'`
// TypeScript knows `action.id` exists and `action.product` doesn't.
// Naming actions in the past tense ("added") describes *what happened*, not *what to do*.
export type CartAction =
  | { type: 'added'; product: Product }
  | { type: 'removed'; id: string }
  | { type: 'quantity_changed'; id: string; quantity: number }
  | { type: 'cleared' }

export const initialCart: CartState = { items: [] }

// Pure: same inputs → same output, never touches `state` in place, no side effects.
// That's what makes it trivially unit-testable (see the tests) and safe for React to
// call twice in Strict Mode.
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'added': {
      const exists = state.items.some((item) => item.id === action.product.id)
      if (exists) {
        return {
          items: state.items.map((item) =>
            item.id === action.product.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }
      return { items: [...state.items, { ...action.product, quantity: 1 }] }
    }
    case 'removed':
      return { items: state.items.filter((item) => item.id !== action.id) }
    case 'quantity_changed':
      // A business rule lives in ONE place instead of in every event handler.
      if (action.quantity <= 0) {
        return { items: state.items.filter((item) => item.id !== action.id) }
      }
      return {
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity: action.quantity } : item,
        ),
      }
    case 'cleared':
      return initialCart
    default: {
      // Exhaustiveness check: if a new action is added to the union without a case,
      // `action` is no longer `never` here and this line fails to compile.
      const unhandled: never = action
      throw new Error(`Unknown action: ${JSON.stringify(unhandled)}`)
    }
  }
}

// Derived data: computed from `items` on each render, so it can never be out of sync.
export function getCartTotals(items: CartItem[]) {
  return items.reduce(
    (acc, item) => ({
      count: acc.count + item.quantity,
      total: acc.total + item.price * item.quantity,
    }),
    { count: 0, total: 0 },
  )
}

export default function SolutionDemo() {
  const [cart, dispatch] = useReducer(cartReducer, initialCart)
  const { count, total } = getCartTotals(cart.items)

  return (
    <div className={styles.layout}>
      <section className={styles.panel}>
        <h3 className={styles.title}>Products</h3>
        <ul className={styles.products}>
          {PRODUCTS.map((product) => (
            <li key={product.id}>
              <span>
                {product.name} · {formatPrice(product.price)}
              </span>
              <button className="btn" onClick={() => dispatch({ type: 'added', product })}>
                Add {product.name} to cart
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel}>
        <h3 className={styles.title}>Cart</h3>
        {cart.items.length === 0 ? (
          <p className={styles.empty}>Your cart is empty.</p>
        ) : (
          <ul className={styles.items}>
            {cart.items.map((item) => (
              <li key={item.id}>
                <span>{item.name}</span>
                <input
                  className={`input ${styles.qty}`}
                  type="number"
                  min={0}
                  aria-label={`Quantity of ${item.name}`}
                  value={item.quantity}
                  onChange={(e) => {
                    // An empty field gives NaN: ignore it rather than removing the item
                    // while the user is still typing.
                    const quantity = e.target.valueAsNumber
                    if (!Number.isNaN(quantity)) {
                      dispatch({ type: 'quantity_changed', id: item.id, quantity })
                    }
                  }}
                />
                <button className="btn" onClick={() => dispatch({ type: 'removed', id: item.id })}>
                  Remove {item.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.summary}>
          <p>Items: {count}</p>
          <p>Total: {formatPrice(total)}</p>
          <button
            className="btn"
            disabled={cart.items.length === 0}
            onClick={() => dispatch({ type: 'cleared' })}
          >
            Clear cart
          </button>
        </div>
      </section>
    </div>
  )
}

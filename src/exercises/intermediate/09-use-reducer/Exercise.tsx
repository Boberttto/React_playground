// 09 – useReducer. Instructions: see README.md (or the "Instructions" tab).
// Tests import the reducer from this file, so it exports non-components on purpose.
// oxlint-disable react/only-export-components
import { useReducer } from 'react'
import { PRODUCTS, formatPrice, type Product } from './catalog'
import styles from './styles.module.scss'

export type CartItem = Product & { quantity: number }
export type CartState = { items: CartItem[] }

// TODO 1: add the 'removed', 'quantity_changed' and 'cleared' actions to the union
export type CartAction = { type: 'added'; product: Product }

export const initialCart: CartState = { items: [] }

// TODO 2: handle every action — without mutating `state`
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'added':
      // Bug: adding the same product twice should increment its quantity.
      return { items: [...state.items, { ...action.product, quantity: 1 }] }
  }
}

// TODO 3: compute { count, total } from the items (don't store them in state!)
export function getCartTotals(items: CartItem[]) {
  void items // remove this line once you use `items`
  return { count: 0, total: 0 }
}

export default function ExerciseDemo() {
  const [cart, dispatch] = useReducer(cartReducer, initialCart)

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
                {/* TODO 4: a number input "Quantity of <name>" + a "Remove <name>" button */}
                <span>× {item.quantity}</span>
              </li>
            ))}
          </ul>
        )}
        {/* TODO 5: "Clear cart" button + "Items: N" and "Total: $X.XX" */}
      </section>
    </div>
  )
}

# 09 – useReducer: Shopping Cart

**Level:** Intermediate · **Time:** ~40 min

## Goal
Manage a shopping cart with `useReducer`. You'll model every possible change as a typed
**action**, write a **pure reducer** that you can unit-test without React, and derive totals
instead of storing them.

## Concepts
- `useReducer(reducer, initialState)` returns `[state, dispatch]`. Event handlers say **what happened** (`dispatch({ type: 'added', product })`); the reducer decides **how state changes**.
- A reducer is a **pure function** `(state, action) => newState`: no mutations, no side effects (no fetch, no `Math.random()`, no `localStorage`). Return new arrays/objects instead of `push`ing or assigning.
- A **discriminated union** (`{ type: 'added'; product } | { type: 'removed'; id } | …`) lets TypeScript narrow `action` inside each `case`, and an exhaustive `switch` with a `never` check makes the compiler tell you when you forget one.
- **Derived state:** item count and total can be computed from `items` on every render. Storing them in state means keeping them in sync by hand — a classic source of bugs.
- Reach for `useReducer` when many event handlers update the same state in related ways; `useState` stays perfectly fine for simple, independent values.

## Tasks
Open `Exercise.tsx`.

1. Complete the `CartAction` union: `added` (with a `product`), `removed` (with an `id`), `quantity_changed` (with an `id` and a `quantity`) and `cleared`.
2. Implement `cartReducer` **without mutating** `state`:
   - `added`: if the product is already in the cart, increment its `quantity`; otherwise append it with `quantity: 1`.
   - `removed`: remove the item with that `id`.
   - `quantity_changed`: set the item's quantity; a quantity `<= 0` removes the item.
   - `cleared`: empty the cart.
   - Add a `default` branch that assigns `action` to a `never` variable (exhaustiveness check).
3. Implement `getCartTotals(items)` returning `{ count, total }` (sum of quantities, sum of `price × quantity`).
4. In `ExerciseDemo`, for each cart item render:
   - a number input labelled **`Quantity of <name>`** that dispatches `quantity_changed`,
   - a button labelled **`Remove <name>`**.
5. Render a **`Clear cart`** button and the totals as `Items: N` and `Total: $X.XX` (use the provided `formatPrice`).

## Check yourself
```bash
npm test -- 09-use-reducer
```

## Hints
<details><summary>Hint 1 – updating one item immutably</summary>

```ts
items: state.items.map((item) =>
  item.id === action.id ? { ...item, quantity: item.quantity + 1 } : item,
)
```
</details>
<details><summary>Hint 2 – exhaustiveness check</summary>

```ts
default: {
  const unhandled: never = action
  throw new Error(`Unknown action: ${JSON.stringify(unhandled)}`)
}
```
If you add a new action type to the union but forget a `case`, this line stops compiling.
</details>
<details><summary>Hint 3 – reading a number input</summary>

`e.target.valueAsNumber` gives you a number (it's `NaN` while the field is empty — decide what that should mean).
</details>

## Going further
- Pass a third argument to `useReducer` (an `init` function) to load the cart from `localStorage` lazily.
- Try [Immer](https://immerjs.github.io/immer/) (`useImmerReducer`) and compare how the reducer reads.
- Move `cartReducer` into its own file and share it with a context (exercise 10) so any component can `dispatch`.

## Sources
- [Extracting State Logic into a Reducer – react.dev](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [`useReducer` – react.dev](https://react.dev/reference/react/useReducer)
- [Choosing the State Structure: avoid redundant state – react.dev](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state)
- [Updating Arrays in State – react.dev](https://react.dev/learn/updating-arrays-in-state)
- [Discriminated unions (Narrowing) – TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

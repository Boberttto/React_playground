# 02 – useState

**Level:** Junior · **Time:** ~30 min

## Goal
Build a `Counter` with a configurable step, an "add step × 3" button, a history of
previous values and an Undo button. You'll practise `useState`, **updater functions**,
the "state as a snapshot" mental model, batching, and updating objects/arrays **immutably**.

## Concepts
- `const [value, setValue] = useState(initial)` gives a component memory between renders. Calling the setter **schedules** a re-render; it does not change the variable you already have.
- **State is a snapshot.** Inside one render, `count` is a constant. This is why the following only adds **1**, not 3:
  ```tsx
  // count === 0 during this whole event handler
  setCount(count + 1) // setCount(0 + 1)
  setCount(count + 1) // setCount(0 + 1)
  setCount(count + 1) // setCount(0 + 1)
  alert(count)        // still 0! the new value only exists in the *next* render
  ```
- **Updater functions** queue a calculation based on the *pending* state instead of the snapshot:
  ```tsx
  setCount(c => c + 1) // 0 → 1
  setCount(c => c + 1) // 1 → 2
  setCount(c => c + 1) // 2 → 3
  ```
- **Batching:** React waits until the whole event handler has run before re-rendering, so the 3 calls above cause **one** render, not three (React 18+ batches everywhere: timeouts, promises, native events too).
- **Never mutate state.** React compares the old and new value with `Object.is`; if you mutate and pass the same object, React may skip the render. Create new objects/arrays instead:
  ```tsx
  setState(s => ({ ...s, count: s.count + 1 }))       // object: spread + override
  setState(s => ({ ...s, history: [...s.history, x] })) // array: add with spread
  setState(s => ({ ...s, history: s.history.slice(0, -1) })) // array: remove last
  ```
  Avoid `push`, `pop`, `splice`, `sort` (in place) and `obj.x = …` on state. Use `map`, `filter`, `slice`, `toSorted`, spread.
- Input values are **strings**. Keep the raw string in state and derive the number during render, so the user can clear the field without it snapping to `0`.

## Tasks
Open `Exercise.tsx`. The state is a single object `{ count, history }` on purpose, so you practise immutable object + array updates.

1. Add a `step` state (string, initial `'1'`) and make the **Step** input controlled (`value` + `onChange`). Derive the numeric step during render (fall back to `0` if it's not a number).
2. **Increment** adds `step` to `count`; **Decrement** subtracts it. Each change must push the *previous* count onto `history` — immutably.
3. Use **updater functions** (`setState(s => …)`) for every update, never the snapshot `state`.
4. **Add step × 3** calls your increment logic three times in a row. With step `2`, the count must go `0 → 6` and history must be `0, 2, 4`. (The starter has the classic bug: it only adds once. Explain why before fixing it.)
5. **Undo** restores the last value from `history` and removes it from the list. Disable it when history is empty.
6. **Reset** sets count back to `0` and clears history.

## Check yourself
```bash
npm test -- 02-use-state
```

## Hints
<details><summary>Hint 1 – a reusable updater</summary>

Write a function that receives the delta and calls the setter with an updater:

```tsx
function changeBy(delta: number) {
  setState(s => ({ count: s.count + delta, history: [...s.history, s.count] }))
}
```
Calling `changeBy(step)` three times now chains correctly, because each updater receives the result of the previous one.
</details>
<details><summary>Hint 2 – reading the last item</summary>

`s.history.at(-1)` returns the last element (or `undefined`). `s.history.slice(0, -1)` returns a new array without it.
</details>
<details><summary>Hint 3 – parsing the step</summary>

`const step = Number(stepInput) || 0` — `Number('')` is `0`, `Number('abc')` is `NaN` (falsy), so both fall back to `0`.
</details>

## Going further
- Log `state.count` right after calling the setter inside the handler. What do you see, and why?
- Replace the object state with `useReducer` — the updater logic moves into a pure function you can unit-test.
- Try mutating instead (`state.history.push(x); setState(state)`) and observe that the UI doesn't update. Why does `Object.is` explain it?

## Sources
- [State: A Component's Memory – react.dev](https://react.dev/learn/state-a-components-memory)
- [State as a Snapshot – react.dev](https://react.dev/learn/state-as-a-snapshot)
- [Queueing a Series of State Updates – react.dev](https://react.dev/learn/queueing-a-series-of-state-updates)
- [Updating Objects in State – react.dev](https://react.dev/learn/updating-objects-in-state)
- [Updating Arrays in State – react.dev](https://react.dev/learn/updating-arrays-in-state)
- [`useState` reference – react.dev](https://react.dev/reference/react/useState)

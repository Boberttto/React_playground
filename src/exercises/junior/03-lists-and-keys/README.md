# 03 – Lists & Keys

**Level:** Junior · **Time:** ~35 min

## Goal
Build a filterable todo list: add, toggle, delete, and filter by **All / Active / Done**.
You'll practise rendering arrays with `map`, choosing **stable keys**, immutable array
updates, and **deriving** values during render instead of storing them in state.

## Concepts
- Render a list with `array.map(item => <li key={item.id}>…</li>)`. The `key` tells React *which* item is which between renders, so it can keep the right DOM node and the right component state attached to it.
- A key must be **stable** (same item → same key across renders) and **unique among siblings**. Ids from your data (or generated once, when the item is created) are ideal. Never generate keys during render (`key={Math.random()}`) — every render would recreate every item.
- **Why not the index?** The index describes a *position*, not an *item*. When items are inserted, removed or reordered, positions shift and React reattaches state to the wrong item. Try it yourself:
  ```tsx
  function Row({ label }: { label: string }) {
    return <li>{label} <input placeholder="note…" /></li> // uncontrolled → state lives in the DOM node
  }
  function Demo() {
    const [items, setItems] = useState(['Apple', 'Banana', 'Cherry'])
    return (
      <>
        <button onClick={() => setItems(items.slice(1))}>Remove first</button>
        <ul>{items.map((item, i) => <Row key={i} label={item} />)}</ul>
      </>
    )
  }
  ```
  Type "ripe" in Apple's note, then click **Remove first**. Apple disappears… but "ripe" is now next to **Banana**. React saw keys `0,1,2` become `0,1`, so it kept rows 0 and 1 and dropped row 2 (Cherry's input). With `key={item}` the right row is removed. Index keys are only OK for static lists that never reorder and whose items have no state.
- **Derived state:** if a value can be computed from existing state/props, don't put it in state. The filtered list and "N items left" are computed during render from `todos` + `filter`. Storing `filteredTodos` in state would mean two sources of truth that can drift apart.
- Immutable array updates: add `[...todos, newTodo]`, remove `todos.filter(t => t.id !== id)`, update `todos.map(t => t.id === id ? { ...t, done: !t.done } : t)`.

## Tasks
Open `Exercise.tsx`.

1. Replace `key={index}` with a stable key.
2. Make the **New todo** input controlled and make the form add a todo on submit (Enter or the **Add** button). Trim the text, ignore empty input, clear the field after adding. Generate the id **once**, when the todo is created (`crypto.randomUUID()`).
3. Render each todo with a checkbox labelled by its text. Toggling it flips `done`.
4. Add a **Delete** button per todo, with an accessible name `Delete <text>` (e.g. `aria-label`).
5. Add a `filter` state (`'all' | 'active' | 'done'`) and three buttons **All / Active / Done**. Mark the current one with `aria-pressed`.
6. Derive `visibleTodos` and the `N items left` counter (active todos, "1 item left" singular) during render — do **not** store them in state.

## Check yourself
```bash
npm test -- 03-lists-and-keys
```

## Hints
<details><summary>Hint 1 – submitting a form</summary>

Put the input and button inside a `<form onSubmit={handleSubmit}>` and call `e.preventDefault()` first, or the browser reloads the page. Enter in the input submits the form for free.
</details>
<details><summary>Hint 2 – filter logic</summary>

```tsx
const visibleTodos = todos.filter(t =>
  filter === 'all' ? true : filter === 'done' ? t.done : !t.done,
)
```
</details>
<details><summary>Hint 3 – a labelled checkbox</summary>

Wrapping is enough: `<label><input type="checkbox" checked={t.done} onChange={…} /> {t.text}</label>`.
</details>

## Going further
- Add the "Remove first" demo above to the page and watch the bug with index keys, then fix it.
- Persist todos to `localStorage` (hint: lazy initial state `useState(() => load())`).
- Add "Clear completed" — one `filter` call.

## Sources
- [Rendering Lists – react.dev](https://react.dev/learn/rendering-lists)
- [Preserving and Resetting State – react.dev](https://react.dev/learn/preserving-and-resetting-state)
- [Updating Arrays in State – react.dev](https://react.dev/learn/updating-arrays-in-state)
- [Choosing the State Structure (avoid redundant state) – react.dev](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state)
- [`aria-pressed` – MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed)
- [`Crypto.randomUUID()` – MDN](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID)

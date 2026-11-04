# React Trick Questions & Gotchas

> **Level legend:** 🟢 [Junior](./junior.md) · 🟡 [Intermediate](./intermediate.md) · 🔴 [Senior](./senior.md) · 🪤 Trick questions (this file)
>
> Each question is tagged with the level where it typically shows up. Target: React 19.3 + React Compiler 1.0.
> Read the snippet, **predict the output out loud**, then open the answer. Every answer has a **The trap:** line describing the tempting wrong answer.
>
> ⚠️ This repo enables the **React Compiler**. A few gotchas (memo, inline callbacks, unstable deps) behave differently in compiled code; the answers say so. Interviewers usually mean plain React unless they mention the compiler.

## Table of contents

1. [🟢 What does `{count && <Badge />}` render when `count` is 0?](#1--what-does-count--badge--render-when-count-is-0)
2. [🟢 What does `console.log(count)` print right after `setCount(count + 1)`?](#2--what-does-consolelogcount-print-right-after-setcountcount--1)
3. [🟢 What happens if you call `setCount(count + 1)` three times in a row?](#3--what-happens-if-you-call-setcountcount--1-three-times-in-a-row)
4. [🟡 Why does this `setInterval` counter get stuck at 1?](#4--why-does-this-setinterval-counter-get-stuck-at-1)
5. [🟢 What can go wrong with `key={index}`?](#5--what-can-go-wrong-with-keyindex)
6. [🟡 How do you reset a component's state when a prop changes?](#6--how-do-you-reset-a-components-state-when-a-prop-changes)
7. [🟢 Why does my component render twice and my Effect run twice?](#7--why-does-my-component-render-twice-and-my-effect-run-twice)
8. [🟡 Why does this Effect run on every render even though its dependencies "didn't change"?](#8--why-does-this-effect-run-on-every-render-even-though-its-dependencies-didnt-change)
9. [🟡 I wrapped my component in `memo`, why does it still re-render?](#9--i-wrapped-my-component-in-memo-why-does-it-still-re-render)
10. [🔴 Can you rely on `useMemo` to run your function only when dependencies change?](#10--can-you-rely-on-usememo-to-run-your-function-only-when-dependencies-change)
11. [🟡 `useEffect` vs `useLayoutEffect`: which one prevents a flicker?](#11--useeffect-vs-uselayouteffect-which-one-prevents-a-flicker)
12. [🟢 Why doesn't the list update after `items.push(newItem)`?](#12--why-doesnt-the-list-update-after-itemspushnewitem)
13. [🟡 If I set state to the same value, does the component re-render?](#13--if-i-set-state-to-the-same-value-does-the-component-re-render)
14. [🟡 Why does my input lose focus/state on every keystroke?](#14--why-does-my-input-lose-focusstate-on-every-keystroke)
15. [🟢 What's wrong with `onClick={handleClick()}`?](#15--whats-wrong-with-onclickhandleclick)
16. [🟡 Why is `event.target` null in my async handler? (event pooling)](#16--why-is-eventtarget-null-in-my-async-handler-event-pooling)
17. [🟡 When a parent re-renders, do all its children re-render?](#17--when-a-parent-re-renders-do-all-its-children-re-render)
18. [🔴 What happens to state when a component's position in the tree changes?](#18--what-happens-to-state-when-a-components-position-in-the-tree-changes)
19. [🔴 Why does `<p>{Date.now()}</p>` cause an error in an SSR app?](#19--why-does-pdatenowp-cause-an-error-in-an-ssr-app)

---

### 1. 🟢 What does `{count && <Badge />}` render when `count` is 0?
<details><summary>Answer</summary>

It renders the text **`0`**. `&&` returns its left operand when it's falsy, and React renders numbers (`0`, `NaN`), but skips `false`, `null`, `undefined` and `true`.

```tsx
{count && <Badge count={count} />}        // ❌ shows "0"
{count > 0 && <Badge count={count} />}    // ✅
{!!count && <Badge count={count} />}      // ✅
{count ? <Badge count={count} /> : null}  // ✅
```

**The trap:** "It renders nothing because 0 is falsy." Falsy decides *which operand is returned*, not whether React renders it.

**Why it matters / follow-up:** Same bug with `items.length && <List />`. In React Native, a stray `0` outside `<Text>` can even crash.

**Sources:** [Conditional Rendering – react.dev](https://react.dev/learn/conditional-rendering), [Logical AND (&&) – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND)
</details>

### 2. 🟢 What does `console.log(count)` print right after `setCount(count + 1)`?
<details><summary>Answer</summary>

```tsx
const [count, setCount] = useState(0);
function handleClick() {
  setCount(count + 1);
  console.log(count); // ?
}
```

It prints **`0`** (the old value). `setCount` doesn't mutate the `count` variable; it **schedules** a re-render. In the next render, `useState` returns the new value, but the current function call (and its closure) keeps the snapshot it was rendered with. That remains true even after an `await` or in a `setTimeout`.

If you need the next value immediately, compute it: `const next = count + 1; setCount(next); console.log(next);`.

**The trap:** "setState is async, so wait a tick and it'll be updated." No amount of waiting changes a `const` in a closure; *state is a snapshot* per render.

**Why it matters / follow-up:** "How do you run code after the state updated?" Usually you don't need to: derive from the new value in render, or use the computed `next` value in the handler. To react to the DOM after the update, use `flushSync` (rare).

**Sources:** [State as a Snapshot – react.dev](https://react.dev/learn/state-as-a-snapshot), [useState (caveats) – react.dev](https://react.dev/reference/react/useState)
</details>

### 3. 🟢 What happens if you call `setCount(count + 1)` three times in a row?
<details><summary>Answer</summary>

```tsx
function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}
```

`count` goes up by **1**, not 3. Each call computes `0 + 1` from the same snapshot, so React queues "replace with 1" three times, and batches them into a single re-render.

Use the **updater function** to base each update on the previous queued state:

```tsx
setCount(c => c + 1);
setCount(c => c + 1);
setCount(c => c + 1); // +3
```

Mixed queue: `setCount(count + 5); setCount(c => c + 1);` from 0 → 6.

**The trap:** "3, because the function runs three times." Also wrong: "it re-renders three times". Updates are batched into one render.

**Why it matters / follow-up:** Tests understanding of the update queue and batching.

**Sources:** [Queueing a Series of State Updates – react.dev](https://react.dev/learn/queueing-a-series-of-state-updates), [useState – react.dev](https://react.dev/reference/react/useState)
</details>

### 4. 🟡 Why does this `setInterval` counter get stuck at 1?
<details><summary>Answer</summary>

```tsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, []); // runs once
```

The interval callback is created in the **first render's closure**, where `count` is `0`. It calls `setCount(0 + 1)` forever → stuck at 1. This is a **stale closure**.

Fixes:
```tsx
// 1. Updater function: no need to read count at all
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id);
}, []);

// 2. If the callback must read the latest props/state without restarting the timer:
const onTick = useEffectEvent(() => {
  setCount(count + step); // always sees latest count & step
});
useEffect(() => {
  const id = setInterval(() => onTick(), 1000);
  return () => clearInterval(id);
}, []);
```

Adding `count` to the deps also "works" but recreates the interval every second.

**The trap:** "The interval isn't running" or "add `// eslint-disable-next-line`". The interval runs fine; it reads an old value. Suppressing the lint rule is what *creates* stale closures.

**Why it matters / follow-up:** Same bug in event listeners registered in Effects, `debounce` created once, and async callbacks. `useEffectEvent` is stable since React 19.2.

**Sources:** [Making setInterval Declarative with React Hooks – overreacted.io](https://overreacted.io/making-setinterval-declarative-with-react-hooks/), [Separating Events from Effects – react.dev](https://react.dev/learn/separating-events-from-effects), [useEffectEvent – react.dev](https://react.dev/reference/react/useEffectEvent), [Closures – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
</details>

### 5. 🟢 What can go wrong with `key={index}`?
<details><summary>Answer</summary>

```tsx
{todos.map((todo, i) => (
  <li key={i}>
    <input type="checkbox" /> {todo.text}
  </li>
))}
```

If you **insert at the top, delete, sort or filter**, the index of each item changes. React matches by key, so the component/DOM at key `0` is reused for a *different* todo: the checkbox (uncontrolled DOM state) and any component state **stay at the old position** and appear attached to the wrong item. It also causes unnecessary updates of every row.

Use a stable ID from the data (`key={todo.id}`). Generate IDs when the item is **created**, not during render (`key={crypto.randomUUID()}` in render remounts everything every time).

**The trap:** "Index is fine as long as keys are unique." Keys must be unique **and stable** across renders. Index is only OK for static lists that never reorder and have no state.

**Why it matters / follow-up:** "Why doesn't React default to something smarter?" It can't know your data's identity; that's exactly what `key` tells it.

**Sources:** [Rendering Lists (keeping list items in order with key) – react.dev](https://react.dev/learn/rendering-lists), [Understanding React's key prop – kentcdodds.com](https://kentcdodds.com/blog/understanding-reacts-key-prop)
</details>

### 6. 🟡 How do you reset a component's state when a prop changes?
<details><summary>Answer</summary>

Give the component a **`key`** tied to the identity that should reset it:

```tsx
<ProfileForm key={userId} userId={userId} />
```

When `key` changes, React treats it as a **different component**: it unmounts the old one (state, DOM, Effects cleaned up) and mounts a fresh one.

Avoid the Effect version:
```tsx
// ❌ Renders once with stale state, then again after the Effect
useEffect(() => { setComment(''); }, [userId]);
```

For *partial* adjustments, prefer deriving during render, or storing an ID instead of a copied object.

**The trap:** "Use `useEffect` to reset state when the prop changes." It works but causes an extra render with stale data and spreads logic around. `key` is the idiomatic answer.

**Why it matters / follow-up:** Shows you understand that state is tied to identity (type + position + key) in the tree.

**Sources:** [Preserving and Resetting State – react.dev](https://react.dev/learn/preserving-and-resetting-state), [You Might Not Need an Effect – react.dev](https://react.dev/learn/you-might-not-need-an-effect)
</details>

### 7. 🟢 Why does my component render twice and my Effect run twice?
<details><summary>Answer</summary>

In **development with `<StrictMode>`**, React intentionally:
- calls component functions (and state initializers, updaters, reducers, `useMemo` functions) **twice**, to catch impure rendering;
- runs every Effect **setup → cleanup → setup** on mount, to catch missing cleanup (since React 19.3 this also happens for roots hydrated from SSR, matching client-rendered roots);
- runs callback refs setup → cleanup → setup.

None of this happens in **production**. A correctly written Effect (with cleanup) is invisible to the user: connect → disconnect → connect.

**The trap:** "It's a bug in React; use a `useRef` flag to skip the second run" or "remove StrictMode." That hides real bugs (leaks, duplicate subscriptions, non-idempotent requests) that would also happen in production when a component remounts (navigation, `<Activity>`, Fast Refresh).

**Why it matters / follow-up:** "My analytics event fires twice in dev, what do I do?" Accept it in dev or send it from the event handler that caused it; for a POST on mount, move it to an event handler.

**Sources:** [`<StrictMode>` – react.dev](https://react.dev/reference/react/StrictMode), [Synchronizing with Effects (how to handle the Effect firing twice) – react.dev](https://react.dev/learn/synchronizing-with-effects), [React 19.3 – react.dev blog](https://react.dev/blog/2026/09/09/react-19-3)
</details>

### 8. 🟡 Why does this Effect run on every render even though its dependencies "didn't change"?
<details><summary>Answer</summary>

```tsx
function ChatRoom({ roomId }: { roomId: string }) {
  const options = { serverUrl, roomId };      // new object every render
  const onMessage = (m: Msg) => log(m);       // new function every render

  useEffect(() => {
    const conn = createConnection(options);
    conn.on('message', onMessage);
    return () => conn.disconnect();
  }, [options, onMessage]); // compared with Object.is → always "changed"
}
```

React compares each dependency with **`Object.is`**. Objects, arrays and functions created during render are **new references** every time, so the Effect re-runs (reconnects) on every render, sometimes causing infinite loops if it also sets state.

Fixes: create the object/function **inside the Effect**, depend on **primitives** (`roomId`), move constants **outside the component**, or use `useEffectEvent` for non-reactive callbacks. `useMemo`/`useCallback` are a last resort.

**The trap:** "The values are the same, so the Effect shouldn't run." Equal *content* is not equal *identity*. Also wrong: removing them from the array (stale values).

**Why it matters / follow-up:** With the **React Compiler**, these values are often memoized automatically, so the bug may not reproduce in compiled code; but the compiler docs warn that code relying on memoization for Effect correctness can change behavior. Write Effects that are correct regardless.

**Sources:** [Removing Effect Dependencies – react.dev](https://react.dev/learn/removing-effect-dependencies), [useEffect – react.dev](https://react.dev/reference/react/useEffect), [Object.is – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is), [Debugging and Troubleshooting (React Compiler) – react.dev](https://react.dev/learn/react-compiler/debugging)
</details>

### 9. 🟡 I wrapped my component in `memo`, why does it still re-render?
<details><summary>Answer</summary>

`memo` skips re-rendering only if **every prop is `Object.is`-equal** to the previous one. It's defeated by:

```tsx
const Row = memo(function Row(props: RowProps) { /* ... */ });

<Row
  onSelect={() => select(id)}      // new function every render
  style={{ color: 'red' }}         // new object every render
  items={data.filter(isVisible)}   // new array every render
>
  <Icon />                         {/* children = new element object every render */}
</Row>
```

Also: `memo` doesn't block re-renders caused by the component's **own state** or a **context** it reads changing.

Fixes: pass primitives, hoist constants, `useCallback`/`useMemo` for the props, or restructure (move state down, pass content as `children` from higher up). Or measure first: often the re-render isn't the actual problem.

**With the React Compiler** (this repo), inline callbacks, objects and JSX children are memoized automatically when their inputs don't change, so this classic trap mostly disappears in compiled components, and you rarely need `memo` by hand.

**The trap:** "`memo` makes the component re-render only when its props change." True in principle, but "change" means *reference* change, and inline values change every render. Also wrong: "wrap everything in `memo`," which adds comparison cost for nothing when props always change.

**Why it matters / follow-up:** "Does `children` break memo?" Yes, JSX children are a new object per render unless memoized.

**Sources:** [memo (minimizing props changes) – react.dev](https://react.dev/reference/react/memo), [useCallback – react.dev](https://react.dev/reference/react/useCallback), [Before You memo() – overreacted.io](https://overreacted.io/before-you-memo/), [Introduction to React Compiler – react.dev](https://react.dev/learn/react-compiler/introduction)
</details>

### 10. 🔴 Can you rely on `useMemo` to run your function only when dependencies change?
<details><summary>Answer</summary>

**No.** `useMemo` is a **performance hint, not a semantic guarantee**. The docs say to rely on it only as an optimization: React may **throw away the cache** (e.g. for components that suspend during initial mount, or in future features like offscreen rendering), and in StrictMode the function is called twice in dev. Your code must still work if the value is recomputed.

So never put side effects in `useMemo`, and don't use it to keep an object identity "for correctness" (e.g. to stop an Effect from looping). If you need a value that persists exactly once, use `useState(() => init())` or `useRef`.

```tsx
// ❌ Relying on useMemo for a one-time side effect / stable instance
const socket = useMemo(() => connect(url), [url]);

// ✅ Side effects belong in Effects
useEffect(() => {
  const socket = connect(url);
  return () => socket.close();
}, [url]);
```

**The trap:** "`useMemo` caches until deps change, guaranteed." The same applies to `useCallback`, `memo`, and the React Compiler's automatic memoization: all are optimizations React is allowed to skip.

**Why it matters / follow-up:** This is precisely why the React Compiler can safely add/remove memoization, and why code that *depends* on memoization breaks when compiled differently.

**Sources:** [useMemo (caveats) – react.dev](https://react.dev/reference/react/useMemo), [React Compiler v1.0 – react.dev blog](https://react.dev/blog/2025/10/07/react-compiler-1)
</details>

### 11. 🟡 `useEffect` vs `useLayoutEffect`: which one prevents a flicker?
<details><summary>Answer</summary>

- `useEffect` usually runs **after the browser paints**. If it measures the DOM and then sets state (e.g. tooltip position), the user may briefly see the wrong position → flicker.
- `useLayoutEffect` runs **after DOM mutations but before paint**, synchronously. Setting state inside it triggers a synchronous re-render before the browser paints, so the user only sees the final position.

```tsx
useLayoutEffect(() => {
  const { height } = tooltipRef.current!.getBoundingClientRect();
  setTooltipHeight(height); // re-render happens before paint
}, []);
```

Costs: it **blocks painting**, so heavy work hurts responsiveness; it doesn't run on the server (render a fallback during SSR). Default to `useEffect`.

Nuance: an Effect triggered by a discrete user interaction (a click) may also be flushed before paint, but you shouldn't rely on that.

**The trap:** "`useLayoutEffect` runs before render" or "it's just a faster `useEffect`." It runs after render and DOM update, and it's *slower* for the user if misused.

**Why it matters / follow-up:** "What's `useInsertionEffect`?" For CSS-in-JS libraries to inject styles before layout effects read layout.

**Sources:** [useLayoutEffect – react.dev](https://react.dev/reference/react/useLayoutEffect), [useEffect – react.dev](https://react.dev/reference/react/useEffect), [useInsertionEffect – react.dev](https://react.dev/reference/react/useInsertionEffect)
</details>

### 12. 🟢 Why doesn't the list update after `items.push(newItem)`?
<details><summary>Answer</summary>

```tsx
function addItem() {
  items.push(newItem); // mutates the existing array
  setItems(items);     // same reference
}
```

React compares the new state with the old using `Object.is`. Same array reference → React bails out and nothing re-renders. You also **mutated state from a previous render**, breaking assumptions of `memo`, the React Compiler, StrictMode and concurrent rendering.

```tsx
setItems([...items, newItem]);         // ✅ new array
setItems(prev => [...prev, newItem]);  // ✅ with updater
```

Same for objects: `user.name = 'x'; setUser(user)` ❌ → `setUser({ ...user, name: 'x' })` ✅.

**The trap:** "It's a React bug" or "call `forceUpdate`." Or: "it works sometimes!" It can *appear* to work when something else triggers a render, which makes the bug intermittent.

**Why it matters / follow-up:** The React Compiler assumes state is immutable; mutation can lead to stale UI in compiled code.

**Sources:** [Updating Arrays in State – react.dev](https://react.dev/learn/updating-arrays-in-state), [Updating Objects in State – react.dev](https://react.dev/learn/updating-objects-in-state), [Components and Hooks must be pure – react.dev](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
</details>

### 13. 🟡 If I set state to the same value, does the component re-render?
<details><summary>Answer</summary>

If the new value is identical to the current state per **`Object.is`**, React **skips re-rendering** the component and its children (the "bailout"). But the docs note that in some cases React **may still need to call your component** once before bailing out; the result is discarded and children aren't re-rendered, so this shouldn't affect your code.

Object.is specifics: `Object.is(NaN, NaN)` is `true`, `Object.is(0, -0)` is `false`, and `{a: 1}` vs `{a: 1}` are different (new object → re-render).

```tsx
setCount(5);           // count is already 5 → bailout
setUser({ ...user });  // new object → re-render, even if content is identical
```

**The trap:** "No, never" (React may still call the component) or "yes, always" (React does bail out). And: "React does a deep comparison" (it doesn't).

**Why it matters / follow-up:** Explains why a `console.log` in the body can fire once more than expected, and why copying objects unnecessarily causes renders.

**Sources:** [useState (caveats on Object.is) – react.dev](https://react.dev/reference/react/useState), [Object.is – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
</details>

### 14. 🟡 Why does my input lose focus/state on every keystroke?
<details><summary>Answer</summary>

```tsx
function Form() {
  const [text, setText] = useState('');

  // ❌ Component defined INSIDE another component
  function Field() {
    return <input value={text} onChange={e => setText(e.target.value)} />;
  }

  return <Field />;
}
```

Each render of `Form` creates a **new `Field` function**, i.e. a **new component type**. Reconciliation sees a different type at the same position, so it unmounts the old `<input>` and mounts a new one: focus and any internal state are lost on every keystroke.

Fix: define components at the **top level** and pass data as props.

```tsx
function Field({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}
```

Related: same cause if you create `lazy()` components or HOC-wrapped components inside render.

**The trap:** "The controlled input is re-rendering, add `useCallback`/`memo`." Re-rendering doesn't lose focus; *remounting* does. Memoization doesn't help; moving the definition out does.

**Why it matters / follow-up:** Probes your model of component identity (type + position).

**Sources:** [Preserving and Resetting State (different components at the same position) – react.dev](https://react.dev/learn/preserving-and-resetting-state), [Your First Component (nesting and organizing) – react.dev](https://react.dev/learn/your-first-component)
</details>

### 15. 🟢 What's wrong with `onClick={handleClick()}`?
<details><summary>Answer</summary>

`handleClick()` is **called during rendering**, and its *return value* (usually `undefined`) is passed as the handler. So it runs on every render, not on click, and if it sets state you get an infinite render loop ("Too many re-renders").

```tsx
<button onClick={handleClick}>OK</button>                  // ✅ pass the function
<button onClick={() => handleDelete(item.id)}>Delete</button> // ✅ wrap to pass args
<button onClick={handleDelete(item.id)}>Delete</button>        // ❌ called during render
```

**The trap:** "It's the same thing, just with parentheses." Or: "Arrow functions in JSX are bad for performance." Creating a closure is negligible, and the React Compiler memoizes them anyway.

**Why it matters / follow-up:** Junior filter question; the follow-up is often about passing arguments to handlers.

**Sources:** [Responding to Events (pitfall: passing vs calling) – react.dev](https://react.dev/learn/responding-to-events)
</details>

### 16. 🟡 Why is `event.target` null in my async handler? (event pooling)
<details><summary>Answer</summary>

Trick: in modern React **it isn't**. **Event pooling was removed in React 17** (2020). Before 17, React reused ("pooled") synthetic event objects and nulled their properties after the handler returned, so reading `e.target` in a `setTimeout`/after `await` returned `null` unless you called `e.persist()`.

Since React 17, synthetic events are regular objects you can read asynchronously. `e.persist()` still exists but does nothing.

```tsx
async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  await validate();
  console.log(e.target.value); // ✅ works in React 17+
}
```

(What can still bite you: `e.currentTarget` is only set while the event is being dispatched, so read it synchronously, which is standard DOM behavior.)

**The trap:** "Because of event pooling, call `e.persist()`." That's outdated (pre-2020) knowledge. Interviewers use it to see whether your React knowledge is current.

**Why it matters / follow-up:** Also from React 17: listeners attach to the **root container** instead of `document`, which made embedding multiple React versions safer.

**Sources:** [Event Pooling (legacy docs) – legacy.reactjs.org](https://legacy.reactjs.org/docs/legacy-event-pooling.html), [React v17.0 Release Candidate: No New Features – legacy.reactjs.org](https://legacy.reactjs.org/blog/2020/08/10/react-v17-rc.html)
</details>

### 17. 🟡 When a parent re-renders, do all its children re-render?
<details><summary>Answer</summary>

**By default, yes**: React re-renders the whole subtree below the component whose state changed, regardless of whether props changed. React doesn't compare props unless asked.

Exceptions / ways to avoid it:
- **`memo`** children with unchanged props are skipped.
- The **React Compiler** memoizes JSX, so unchanged child elements are skipped automatically.
- **Elements passed from above** (`children` or other element props) keep the same identity when only the wrapper's state changes, so React skips them:

```tsx
function ColorPicker({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState('red');
  return <div style={{ color }}>{children}</div>; // children don't re-render on color change
}

<ColorPicker>
  <ExpensiveTree />
</ColorPicker>;
```

- Components **above** or **beside** the updated component don't re-render.

Re-rendering ≠ DOM update: if output is the same, the commit changes nothing.

**The trap:** "Only children whose props changed re-render" (that's `memo` behavior, not the default). Or the opposite: "the whole app re-renders" (only the subtree).

**Why it matters / follow-up:** Leads to "lift content up / move state down" as the first, free optimization before memoization.

**Sources:** [Render and Commit – react.dev](https://react.dev/learn/render-and-commit), [Before You memo() – overreacted.io](https://overreacted.io/before-you-memo/), [Why React Re-Renders – joshwcomeau.com](https://www.joshwcomeau.com/react/why-react-re-renders/), [memo – react.dev](https://react.dev/reference/react/memo)
</details>

### 18. 🔴 What happens to state when a component's position in the tree changes?
<details><summary>Answer</summary>

State lives in React's tree, tied to the **position** (and type, and key), not to the JSX expression:

```tsx
// Same type, same position → state is PRESERVED when isFancy toggles
{isFancy ? <Counter isFancy /> : <Counter />}

// Different position → state is RESET
{isFancy ? (
  <div><Counter isFancy /></div>   // Counter is now a child of <div>
) : (
  <section><Counter /></section>   // different parent type → whole subtree remounts
)}

// Two slots → each has its own state; toggling unmounts one and mounts the other
{isPlayerA && <Counter person="A" />}
{!isPlayerA && <Counter person="B" />}
```

Rules:
- **Same component type at the same position** → state preserved (even if it "looks" like a different element in your code).
- **Different type at that position**, or a **parent of a different type**, → the subtree is unmounted, state destroyed.
- **A different `key`** → treated as a different component (reset), and a **stable key** lets an element move among siblings while keeping its state.
- Moving a component to a different parent (outside of keyed siblings) loses its state; to keep it across hide/show, lift it up or use `<Activity>`.

**The trap:** "Each `<Counter />` in the JSX is a separate instance with its own state" (in the ternary case they're the same slot) or "state is preserved as long as the component is rendered somewhere."

**Why it matters / follow-up:** "Make the two counters in the ternary independent." Give them different `key`s (`key="fancy"` / `key="plain"`).

**Sources:** [Preserving and Resetting State – react.dev](https://react.dev/learn/preserving-and-resetting-state), [Understanding Your UI as a Tree – react.dev](https://react.dev/learn/understanding-your-ui-as-a-tree), [`<Activity>` – react.dev](https://react.dev/reference/react/Activity)
</details>

### 19. 🔴 Why does `<p>{Date.now()}</p>` cause an error in an SSR app?
<details><summary>Answer</summary>

The server renders a timestamp into the HTML; milliseconds (or seconds) later, the client's hydration render computes a **different** value. React expects the first client render to **match the server HTML exactly**, so it reports a **hydration mismatch** (React 19 logs one error with a diff). The same happens with `Math.random()`, `crypto.randomUUID()`, locale/time-zone dependent formatting (`toLocaleString()`), and `typeof window` checks.

Fixes:
- Pass the value from the server as data (both sides render the same timestamp).
- Use `useId()` for IDs.
- Render client-only values **after hydration**: placeholder on both sides, then an Effect sets the real value; or, in React 19.3, `use(browser())` (from `react-dom`) inside a `<Suspense>` boundary to make that subtree client-only.
- For an unavoidable single text node, `suppressHydrationWarning` on that element (escape hatch, one level deep).

**The trap:** "It's just a warning, the client value wins." React doesn't promise to patch mismatched text/attributes, and it may throw away the server HTML up to the nearest Suspense boundary and re-render on the client, losing SSR's performance benefit.

**Why it matters / follow-up:** "Why does it work in a Vite SPA?" No server HTML → no hydration (this repo uses `createRoot`).

**Sources:** [hydrateRoot (handling different client and server content) – react.dev](https://react.dev/reference/react-dom/client/hydrateRoot), [useId – react.dev](https://react.dev/reference/react/useId), [browser – react.dev](https://react.dev/reference/react-dom/browser), [The Perils of Rehydration – joshwcomeau.com](https://www.joshwcomeau.com/react/the-perils-of-rehydration/)
</details>

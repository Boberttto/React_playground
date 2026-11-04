# Junior React Interview Questions

> **Level legend:** 🟢 Junior (this file) · 🟡 [Intermediate](./intermediate.md) · 🔴 [Senior](./senior.md) · 🪤 [Trick questions](./trick-questions.md)
>
> Target: React 19.3, TypeScript, Vite 8, React Compiler 1.0 (as of November 2026).
> Answer each question **out loud** before opening the `Answer` block.

## Table of contents

1. [What is React, and what does "declarative" mean?](#1-what-is-react-and-what-does-declarative-mean)
2. [What is JSX and what does it compile to?](#2-what-is-jsx-and-what-does-it-compile-to)
3. [What is a component, and what rules must it follow?](#3-what-is-a-component-and-what-rules-must-it-follow)
4. [What is the difference between props and state?](#4-what-is-the-difference-between-props-and-state)
5. [How do you give a prop a default value in React 19?](#5-how-do-you-give-a-prop-a-default-value-in-react-19)
6. [What is the `children` prop?](#6-what-is-the-children-prop)
7. [How does `useState` work?](#7-how-does-usestate-work)
8. [Why must state be treated as immutable?](#8-why-must-state-be-treated-as-immutable)
9. [Why do list items need a `key`, and what makes a good key?](#9-why-do-list-items-need-a-key-and-what-makes-a-good-key)
10. [How do you handle events in React?](#10-how-do-you-handle-events-in-react)
11. [What are the common patterns for conditional rendering?](#11-what-are-the-common-patterns-for-conditional-rendering)
12. [Controlled vs uncontrolled inputs: what is the difference?](#12-controlled-vs-uncontrolled-inputs-what-is-the-difference)
13. [What are Fragments and why use them?](#13-what-are-fragments-and-why-use-them)
14. [What is the "virtual DOM"?](#14-what-is-the-virtual-dom)
15. [What does "one-way data flow" mean?](#15-what-does-one-way-data-flow-mean)
16. [What does "lifting state up" mean?](#16-what-does-lifting-state-up-mean)
17. [What is `useEffect` for, and when does it run?](#17-what-is-useeffect-for-and-when-does-it-run)
18. [What is `<StrictMode>` and why does my component render twice?](#18-what-is-strictmode-and-why-does-my-component-render-twice)
19. [What does "rendering" mean in React, and what triggers a re-render?](#19-what-does-rendering-mean-in-react-and-what-triggers-a-re-render)
20. [How do you start a new React project in 2026, and how is the app mounted?](#20-how-do-you-start-a-new-react-project-in-2026-and-how-is-the-app-mounted)
21. [How do you style components (`className`, `style`, CSS Modules)?](#21-how-do-you-style-components-classname-style-css-modules)

---

### 1. What is React, and what does "declarative" mean?
<details><summary>Answer</summary>

React is a JavaScript library for building user interfaces out of **components**. You describe *what* the UI should look like for a given state, and React figures out *how* to update the DOM to match. That is "declarative": instead of imperatively writing `button.classList.add('active')`, you write `<button className={isActive ? 'active' : ''}>` and let React reconcile.

The mental model is `UI = f(state)`: when state changes, React calls your component again and applies the minimal set of DOM changes. React itself is renderer-agnostic (`react-dom` for the web, React Native for mobile).

**Why it matters / follow-up:** The interviewer checks you understand the core model, not just syntax. Follow-up: "What is the difference between a library and a framework?" React handles the view layer; routing, data fetching and bundling come from other tools or from a framework (Next.js, React Router framework mode, Expo...).

**Sources:** [Thinking in React – react.dev](https://react.dev/learn/thinking-in-react), [Reacting to Input with State – react.dev](https://react.dev/learn/reacting-to-input-with-state)
</details>

### 2. What is JSX and what does it compile to?
<details><summary>Answer</summary>

JSX is a syntax extension that lets you write HTML-like markup inside JavaScript. It is **not** HTML: attributes are camelCase (`className`, `htmlFor`, `onClick`), every tag must be closed, and a component must return a single root (or a Fragment). Curly braces `{}` embed any JavaScript *expression*.

The compiler (Babel / SWC / Oxc, via Vite) transforms JSX into function calls. With the **automatic JSX runtime** (required by React 19), the output looks like:

```tsx
// You write
const el = <h1 className="title">Hello {name}</h1>;

// Roughly compiles to
import { jsx as _jsx } from 'react/jsx-runtime';
const el = _jsx('h1', { className: 'title', children: ['Hello ', name] });
```

That's why you no longer need `import React from 'react'` in every file. The result is a plain object (a **React element**) describing what to render, not a DOM node.

**Why it matters / follow-up:** "Can you use `if` inside JSX?" No, only expressions: use a ternary, `&&`, or compute a variable before the `return`. Also: React 19 *requires* the new JSX transform (it's needed for `ref` as a prop).

**Sources:** [Writing Markup with JSX – react.dev](https://react.dev/learn/writing-markup-with-jsx), [JavaScript in JSX with Curly Braces – react.dev](https://react.dev/learn/javascript-in-jsx-with-curly-braces), [React 19 Upgrade Guide – react.dev](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
</details>

### 3. What is a component, and what rules must it follow?
<details><summary>Answer</summary>

A component is a JavaScript function that returns JSX (class components still exist but are legacy for new code). Rules:

- **Name starts with a capital letter** (`<Profile />`); lowercase tags are treated as HTML elements.
- **It must be pure** during render: same props/state/context → same output, no side effects (no fetching, no mutating external variables, no DOM changes while rendering). Side effects belong in event handlers or Effects.
- **Never call a component like a function** (`Profile()`); render it with JSX so React manages its state and hooks.
- **Don't define components inside other components** (they'd be recreated each render and lose state).

```tsx
type Props = { name: string };

export function Greeting({ name }: Props) {
  return <p>Hello, {name}!</p>;
}
```

**Why it matters / follow-up:** Purity is what makes StrictMode, concurrent rendering and the React Compiler possible. Follow-up: "Why can't a component modify a variable declared outside it?"

**Sources:** [Your First Component – react.dev](https://react.dev/learn/your-first-component), [Keeping Components Pure – react.dev](https://react.dev/learn/keeping-components-pure), [Rules of React – react.dev](https://react.dev/reference/rules)
</details>

### 4. What is the difference between props and state?
<details><summary>Answer</summary>

| | Props | State |
|---|---|---|
| Owned by | The parent | The component itself |
| Mutable by the component? | No (read-only) | Only through its setter |
| Purpose | Configure a component from outside | Remember values that change over time (interaction) |
| Changing it | Parent re-renders with new props | Calling `setX` schedules a re-render |

Props are like function arguments; state is a component's private memory that survives re-renders. A value passed as a prop is often someone else's state.

**Why it matters / follow-up:** "Should I copy a prop into state?" Usually no. That creates two sources of truth that drift apart. Derive values from props during render instead (or use a `key` to reset state when an identity changes).

**Sources:** [Passing Props to a Component – react.dev](https://react.dev/learn/passing-props-to-a-component), [State: A Component's Memory – react.dev](https://react.dev/learn/state-a-components-memory), [Choosing the State Structure – react.dev](https://react.dev/learn/choosing-the-state-structure)
</details>

### 5. How do you give a prop a default value in React 19?
<details><summary>Answer</summary>

Use **JavaScript default parameters** in the destructuring:

```tsx
type ButtonProps = { variant?: 'primary' | 'ghost'; label: string };

function Button({ variant = 'primary', label }: ButtonProps) {
  return <button className={variant}>{label}</button>;
}
```

`Component.defaultProps` was **removed for function components in React 19** (it still works only for class components). `propTypes` checks were also removed and are silently ignored; use TypeScript for prop validation.

Note that a default applies only when the prop is `undefined` (missing), not when it's `null`.

**Why it matters / follow-up:** Interviewers use this to spot outdated knowledge (tutorials from 2018–2022 still show `defaultProps` and `PropTypes`).

**Sources:** [React 19 Upgrade Guide – react.dev](https://react.dev/blog/2024/04/25/react-19-upgrade-guide), [Passing Props to a Component – react.dev](https://react.dev/learn/passing-props-to-a-component)
</details>

### 6. What is the `children` prop?
<details><summary>Answer</summary>

Whatever you put between a component's opening and closing tags is passed as the special `children` prop. It enables **composition**: generic wrappers (cards, layouts, modals) that don't need to know their content.

```tsx
import type { ReactNode } from 'react';

function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>;
}

<Card>
  <h2>Title</h2>
  <p>Any content</p>
</Card>;
```

In TypeScript, type it as `ReactNode` (covers elements, strings, numbers, `null`, arrays...).

**Why it matters / follow-up:** Composition via `children` is the first tool against "prop drilling", before reaching for Context. Bonus: elements passed as `children` are created by the parent, so when the wrapper re-renders on its own state, those children don't need to re-render.

**Sources:** [Passing Props to a Component – react.dev](https://react.dev/learn/passing-props-to-a-component), [Passing Data Deeply with Context – react.dev](https://react.dev/learn/passing-data-deeply-with-context)
</details>

### 7. How does `useState` work?
<details><summary>Answer</summary>

`useState(initial)` returns a pair `[value, setValue]`. React stores the value outside your function, tied to the component's position in the tree. Calling the setter **schedules** a re-render with the new value; it doesn't change the variable in the current render.

```tsx
const [count, setCount] = useState(0);

// Updater function: use when the next value depends on the previous one
setCount(c => c + 1);

// Lazy initializer: the function runs only on the first render
const [todos, setTodos] = useState(() => loadTodosFromStorage());
```

Key points:
- Pass a **function** to the setter when the new state depends on the old one.
- Pass a **function** as the initial value if computing it is expensive (`useState(load)`, not `useState(load())`).
- If the new value is identical (`Object.is`) to the current one, React may bail out of the re-render.

**Why it matters / follow-up:** "What happens if I `console.log(count)` right after `setCount(count + 1)`?" You get the old value (state is a snapshot). See the trick questions file.

**Sources:** [useState – react.dev](https://react.dev/reference/react/useState), [State as a Snapshot – react.dev](https://react.dev/learn/state-as-a-snapshot), [Queueing a Series of State Updates – react.dev](https://react.dev/learn/queueing-a-series-of-state-updates)
</details>

### 8. Why must state be treated as immutable?
<details><summary>Answer</summary>

React decides whether something changed by comparing references (`Object.is`). If you mutate an object or array in place, the reference is the same, so React may skip the update, and other code holding the old reference sees inconsistent data. Always create a **new** object/array:

```tsx
// ❌ Mutation
todos.push(newTodo);
setTodos(todos);

// ✅ New array
setTodos([...todos, newTodo]);
setTodos(todos.filter(t => t.id !== id));
setTodos(todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)));

// ✅ Nested object
setUser({ ...user, address: { ...user.address, city: 'Lyon' } });
```

Prefer non-mutating methods (`map`, `filter`, `toSorted`, `toReversed`, `with`) over mutating ones (`push`, `splice`, `sort`, `reverse`).

**Why it matters / follow-up:** Immutability also enables cheap change detection for `memo`, the React Compiler, and features like undo/redo. Follow-up: "How would you handle deeply nested state?" Flatten/normalize it, or use a helper like Immer.

**Sources:** [Updating Objects in State – react.dev](https://react.dev/learn/updating-objects-in-state), [Updating Arrays in State – react.dev](https://react.dev/learn/updating-arrays-in-state)
</details>

### 9. Why do list items need a `key`, and what makes a good key?
<details><summary>Answer</summary>

When you render a list, React uses `key` to match each item with the one from the previous render. That's how it knows an item moved, was inserted or was deleted, and keeps the right state and DOM node attached to the right item.

A good key is **stable, unique among siblings and derived from the data** (e.g. a database `id`). Avoid:
- **Array index** when the list can be reordered, filtered or have items inserted: state and inputs get attached to the wrong item.
- **`Math.random()` / `crypto.randomUUID()` during render**: a new key every render remounts every item.

```tsx
<ul>
  {todos.map(todo => (
    <li key={todo.id}>{todo.title}</li>
  ))}
</ul>
```

Keys only need to be unique among siblings, and they aren't passed as a prop to the component.

**Why it matters / follow-up:** "When is index acceptable?" For static lists that never reorder and have no local state. Follow-up: keys can also be used on purpose to **reset** a component's state (see trick questions).

**Sources:** [Rendering Lists – react.dev](https://react.dev/learn/rendering-lists), [Preserving and Resetting State – react.dev](https://react.dev/learn/preserving-and-resetting-state)
</details>

### 10. How do you handle events in React?
<details><summary>Answer</summary>

Pass a **function** (not a function call) to a camelCase prop like `onClick`, `onChange`, `onSubmit`. React gives the handler a cross-browser **synthetic event** object that wraps the native event (`e.nativeEvent`) and has the usual `preventDefault()` / `stopPropagation()`.

```tsx
function Form() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // ...
  }
  return (
    <form onSubmit={handleSubmit}>
      <button onClick={() => console.log('clicked')}>Send</button>
    </form>
  );
}
```

Details worth knowing:
- `onClick={handle}` ✅, `onClick={handle()}` ❌ (calls it during render).
- Events bubble through the **React tree** (even through portals). Use `onClickCapture` for the capture phase.
- React attaches listeners at the root container (since React 17), not on `document`.
- Event handlers are the right place for side effects; they don't need to be pure.

**Why it matters / follow-up:** "How do you pass an argument?" `onClick={() => remove(item.id)}`. "How does a child notify its parent?" The parent passes a callback prop like `onSelect`.

**Sources:** [Responding to Events – react.dev](https://react.dev/learn/responding-to-events), [Common components (event object) – react.dev](https://react.dev/reference/react-dom/components/common)
</details>

### 11. What are the common patterns for conditional rendering?
<details><summary>Answer</summary>

```tsx
// 1. Early return
if (isLoading) return <Spinner />;

// 2. Ternary: either/or
{isLoggedIn ? <Dashboard /> : <Login />}

// 3. Logical &&: render or nothing
{hasErrors && <ErrorList errors={errors} />}

// 4. Variable computed before return
let content;
if (status === 'error') content = <Error />;
else content = <Data />;

// 5. Return null to render nothing
```

Gotcha: with `&&`, the left side must be a **boolean**. `{items.length && <List />}` renders `0` when the list is empty. Use `items.length > 0 &&`.

**Why it matters / follow-up:** Readability: nested ternaries get unreadable quickly; extract a component or a variable. Also: switching between two different components in the same position resets state.

**Sources:** [Conditional Rendering – react.dev](https://react.dev/learn/conditional-rendering), [Logical AND (&&) – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND)
</details>

### 12. Controlled vs uncontrolled inputs: what is the difference?
<details><summary>Answer</summary>

- **Controlled**: React state is the source of truth. You pass `value` and update it in `onChange`. Good for live validation, formatting or conditionally disabling a button.
- **Uncontrolled**: the DOM keeps the value. You pass `defaultValue` (or `defaultChecked`) and read it when needed: from a ref, or, in React 19, from the `FormData` passed to a form `action`.

```tsx
// Controlled
const [email, setEmail] = useState('');
<input value={email} onChange={e => setEmail(e.target.value)} />;

// Uncontrolled + React 19 form action
function Signup() {
  async function signup(formData: FormData) {
    await createUser(formData.get('email') as string);
  }
  return (
    <form action={signup}>
      <input name="email" defaultValue="" />
      <button type="submit">Sign up</button>
    </form>
  );
}
```

Pitfalls: passing `value` without `onChange` makes the input read-only (React warns). Switching between `value={undefined}` and a string flips it from uncontrolled to controlled (also a warning). Initialize with `''`, not `undefined`.

**Why it matters / follow-up:** React 19 Actions make uncontrolled forms much more attractive. Follow-up: "When would you still choose controlled?" When the UI must react to each keystroke.

**Sources:** [`<input>` – react.dev](https://react.dev/reference/react-dom/components/input), [`<form>` – react.dev](https://react.dev/reference/react-dom/components/form)
</details>

### 13. What are Fragments and why use them?
<details><summary>Answer</summary>

A Fragment groups multiple elements without adding a wrapper DOM node. This keeps markup valid (e.g. several `<td>` or `<li>` returned from a component) and avoids breaking CSS layouts like flex/grid.

```tsx
<>
  <dt>Term</dt>
  <dd>Definition</dd>
</>

// Long form: needed when you need a key
import { Fragment } from 'react';
{items.map(item => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.description}</dd>
  </Fragment>
))}
```

Since **React 19.3**, `<Fragment>` also accepts a `ref`, giving a `FragmentInstance` that can focus, observe or add listeners to the fragment's DOM children as a group.

**Why it matters / follow-up:** "Why can't the short syntax `<>` take a key?" It accepts no attributes; use `<Fragment key>`.

**Sources:** [`<Fragment>` – react.dev](https://react.dev/reference/react/Fragment), [React 19.3 – react.dev blog](https://react.dev/blog/2026/09/09/react-19-3)
</details>

### 14. What is the "virtual DOM"?
<details><summary>Answer</summary>

"Virtual DOM" is the common name for React's approach: your components return a lightweight tree of **React elements** (plain JS objects). On each update, React renders a new tree, compares it with the previous one (**reconciliation**), and applies only the necessary changes to the real DOM.

A nuanced answer adds:
- The point isn't that the virtual DOM is "faster than the DOM". It's that it lets you write declarative code while React batches and minimizes DOM work.
- The React team doesn't really use the term anymore; the docs talk about **rendering** (calling components) and **committing** (applying changes to the DOM).
- Internally, React keeps a tree of **Fibers** (one per component instance) that holds state and lets React split and prioritize work.

**Why it matters / follow-up:** "How does React diff two trees efficiently?" Different element types → tear down and rebuild; same type → update props; `key`s match children in lists.

**Sources:** [Render and Commit – react.dev](https://react.dev/learn/render-and-commit), [Preserving and Resetting State – react.dev](https://react.dev/learn/preserving-and-resetting-state), [Reconciliation (legacy docs) – legacy.reactjs.org](https://legacy.reactjs.org/docs/reconciliation.html)
</details>

### 15. What does "one-way data flow" mean?
<details><summary>Answer</summary>

Data flows **down** the tree through props, from parent to child. A child can't modify its parent's data directly. To change something, the parent passes down a **callback** and the child calls it ("events flow up"). That makes it easy to see where any value comes from and who can change it.

```tsx
function Parent() {
  const [value, setValue] = useState('');
  return <SearchBox value={value} onChange={setValue} />;
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}
```

**Why it matters / follow-up:** Compare with two-way binding (AngularJS `ng-model`, Vue `v-model`, which is sugar over the same idea). "How do siblings share data?" Lift state to their common parent.

**Sources:** [Thinking in React – react.dev](https://react.dev/learn/thinking-in-react), [Sharing State Between Components – react.dev](https://react.dev/learn/sharing-state-between-components)
</details>

### 16. What does "lifting state up" mean?
<details><summary>Answer</summary>

When two components need the same changing data, you move the state to their **closest common parent** and pass it down as props, together with the functions that update it. The children become "controlled" by the parent, and there is a **single source of truth**.

```tsx
function Accordion() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <>
      <Panel title="About" isOpen={openIndex === 0} onOpen={() => setOpenIndex(0)} />
      <Panel title="Etymology" isOpen={openIndex === 1} onOpen={() => setOpenIndex(1)} />
    </>
  );
}
```

**Why it matters / follow-up:** The opposite is also a skill: keep state **as low as possible** (colocation), since state high in the tree re-renders more. If lifting leads to passing props through many layers, consider composition (`children`) or Context.

**Sources:** [Sharing State Between Components – react.dev](https://react.dev/learn/sharing-state-between-components)
</details>

### 17. What is `useEffect` for, and when does it run?
<details><summary>Answer</summary>

`useEffect` lets you **synchronize a component with an external system** (network, browser APIs, subscriptions, timers, third-party widgets). It runs **after** React has committed the render to the screen.

```tsx
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();
  return () => connection.disconnect(); // cleanup
}, [roomId]); // dependencies
```

- No dependency array → runs after every render.
- `[]` → runs after mount (and its cleanup on unmount).
- `[a, b]` → runs after mount and whenever `a` or `b` changed (`Object.is`).
- The **cleanup** runs before the effect re-runs and on unmount.

What it's *not* for: computing derived data (do it during render), or reacting to a user event (do it in the event handler).

**Why it matters / follow-up:** "Your effect runs twice in development, why?" StrictMode mounts, unmounts and remounts to check your cleanup. "How do you fetch data?" In an app, prefer a framework loader or a library like TanStack Query; in an effect, you must handle race conditions with cleanup.

**Sources:** [useEffect – react.dev](https://react.dev/reference/react/useEffect), [Synchronizing with Effects – react.dev](https://react.dev/learn/synchronizing-with-effects), [You Might Not Need an Effect – react.dev](https://react.dev/learn/you-might-not-need-an-effect)
</details>

### 18. What is `<StrictMode>` and why does my component render twice?
<details><summary>Answer</summary>

`<StrictMode>` is a **development-only** wrapper that enables extra checks:
- Components (and `useState`/`useMemo`/`useReducer` initializers and updaters) are **called twice** to reveal impure rendering.
- Every Effect runs **an extra setup → cleanup → setup** cycle to reveal missing cleanup.
- Callback refs also get an extra setup/cleanup cycle (React 19).
- Warnings for deprecated APIs.

None of this happens in **production builds**. If the double run breaks your app, it's revealing a real bug (e.g. a subscription without cleanup that would leak when the user navigates away and back).

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

**Why it matters / follow-up:** "How do you stop the effect from running twice?" Wrong question: fix the cleanup instead. Using a ref flag to skip the second run hides the bug.

**Sources:** [`<StrictMode>` – react.dev](https://react.dev/reference/react/StrictMode), [Synchronizing with Effects – react.dev](https://react.dev/learn/synchronizing-with-effects)
</details>

### 19. What does "rendering" mean in React, and what triggers a re-render?
<details><summary>Answer</summary>

Rendering means **React calling your component function** to find out what the UI should look like. It's followed by the **commit**, where React applies differences to the DOM. A render doesn't necessarily change the DOM.

A component re-renders when:
1. Its own **state** changes (a setter was called with a different value).
2. Its **parent re-renders** (by default, children re-render too, whether or not props changed).
3. A **Context** it reads changes.

Props changing is not a separate trigger: props only change because the parent re-rendered.

**Why it matters / follow-up:** "Is a re-render bad?" Not by itself; renders are usually cheap. Optimize when you measure a problem. With the React Compiler (enabled in this repo), many unnecessary re-renders are skipped automatically.

**Sources:** [Render and Commit – react.dev](https://react.dev/learn/render-and-commit), [Why React Re-Renders – joshwcomeau.com](https://www.joshwcomeau.com/react/why-react-re-renders/)
</details>

### 20. How do you start a new React project in 2026, and how is the app mounted?
<details><summary>Answer</summary>

**Create React App is deprecated** (sunset in February 2025). The React team recommends starting with a **framework** (Next.js, React Router framework mode, Expo for native...) or, for a client-side app, a build tool like **Vite** (`npm create vite@latest`, which also offers a React Compiler template).

The app is mounted with `createRoot` from `react-dom/client`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`ReactDOM.render`, `ReactDOM.hydrate` and `unmountComponentAtNode` were **removed in React 19** (use `createRoot`, `hydrateRoot`, `root.unmount()`).

**Why it matters / follow-up:** Shows you're current. Follow-up: "Why does React recommend frameworks?" Routing, data fetching, code splitting and SSR are hard to get right alone.

**Sources:** [Sunsetting Create React App – react.dev blog](https://react.dev/blog/2025/02/14/sunsetting-create-react-app), [Creating a React App – react.dev](https://react.dev/learn/creating-a-react-app), [createRoot – react.dev](https://react.dev/reference/react-dom/client/createRoot), [React 19 Upgrade Guide – react.dev](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
</details>

### 21. How do you style components (`className`, `style`, CSS Modules)?
<details><summary>Answer</summary>

- **`className`** (not `class`) with regular CSS / Sass files.
- **`style`** takes an **object** with camelCase properties: `style={{ backgroundColor: 'red', marginTop: 8 }}` (numbers become `px` for most properties). Useful for dynamic values, not for whole designs.
- **CSS Modules** (`Button.module.scss`, supported by Vite out of the box) scope class names to the file: `import styles from './Button.module.scss'` → `className={styles.primary}`.
- Other options: utility CSS (Tailwind), CSS-in-JS (note that runtime CSS-in-JS libraries are a poor fit for Server Components and streaming).

**Why it matters / follow-up:** "Why `className`?" JSX maps to DOM properties, and `class` is a reserved word in JavaScript.

**Sources:** [Writing Markup with JSX – react.dev](https://react.dev/learn/writing-markup-with-jsx), [Common components (style, className) – react.dev](https://react.dev/reference/react-dom/components/common), [Features (CSS Modules) – vite.dev](https://vite.dev/guide/features)
</details>

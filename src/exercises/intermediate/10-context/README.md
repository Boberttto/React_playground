# 10 – Context

**Level:** Intermediate · **Time:** ~40 min

## Goal
Share a theme and a signed-in user across a component tree without passing props through
every level. Along the way, make your contexts **safe** (a helpful error outside the provider)
and **cheap** (consumers only re-render when what they read actually changes).

## Concepts
- `createContext(default)` + `<MyContext value={…}>` (React 19: the context itself is the provider — no more `.Provider`) + `useContext(MyContext)` (or `use(MyContext)`).
- Creating the context with `null` and wrapping `useContext` in a **custom hook** (`useTheme()`) that throws outside the provider turns a silent bug into a clear error message — and gives you a non-nullable type for free.
- **Every consumer re-renders when the context value changes** (compared with `Object.is`). A new `{ theme, toggleTheme }` object on each render of the provider means a new value each time → memoize it (`useMemo`, or let the React Compiler do it).
- **Split state and actions:** components that only *do* things (a "Log out" button) shouldn't re-render when the *data* changes. Put the user in one context and the stable `login`/`logout` functions in another.
- **When NOT to use context:** passing props 2–3 levels down is fine and explicit. Often **composition** — passing JSX as `children` — removes the drilling entirely. Context is for truly global-ish data: theme, current user, locale, router.

## Tasks
Open `Exercise.tsx`.

1. **Theme context**
   - Create `ThemeContext` with `null` as its default value.
   - `ThemeProvider` holds `theme` (`'light' | 'dark'`, starting at the `initialTheme` prop, default `'light'`) and a `toggleTheme` function. Provide a **memoized** `{ theme, toggleTheme }` value.
   - `useTheme()` returns the context value and **throws** an error containing `ThemeProvider` when used outside it.
   - `ThemeToggleButton` shows **`Switch to dark theme`** / **`Switch to light theme`** and toggles.
2. **Auth contexts (split state / actions)**
   - `AuthStateContext` holds `user: { name: string } | null`.
   - `AuthActionsContext` holds `{ login(name), logout() }` — this object must keep the **same identity** across renders.
   - `useAuth()` and `useAuthActions()` both throw outside `<AuthProvider>`.
3. **UserMenu** — when signed out, render a form with a **`Name`** field and a **`Log in`** button; when signed in, render **`Signed in as <name>`** and a `LogoutButton`.
4. `LogoutButton` must only read `useAuthActions()` — check the test that counts its renders.
5. Look at `Panel` in the demo: it receives its content as `children`, so it never needs to know about the theme or the user. That's composition — no context needed.

## Check yourself
```bash
npm test -- 10-context
```

## Hints
<details><summary>Hint 1 – the safe custom hook</summary>

```ts
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx // typed as ThemeContextValue, not ThemeContextValue | null
}
```
</details>
<details><summary>Hint 2 – stable actions</summary>

State setters from `useState` are stable, so an actions object built from them never needs to change:
```ts
const actions = useMemo(() => ({
  login: (name: string) => setUser({ name }),
  logout: () => setUser(null),
}), [])
```
</details>
<details><summary>Hint 3 – why children don't re-render</summary>

When `AuthProvider`'s state changes it re-renders, but the `children` prop is the same JSX element
created by its parent, so React skips it. Only components that **read** a changed context re-render.
</details>

## Going further
- Replace `useContext` with React 19's `use(ThemeContext)` — unlike hooks, `use` can be called inside an `if`.
- Combine this exercise with 09: put the cart reducer's `state` and `dispatch` in two contexts (`dispatch` is already stable).
- Use the React DevTools Profiler ("Highlight updates when components render") to watch which components re-render on login.
- Persist the theme with your `useLocalStorage` hook from exercise 08.

## Sources
- [Passing Data Deeply with Context – react.dev](https://react.dev/learn/passing-data-deeply-with-context)
- [`useContext` – react.dev](https://react.dev/reference/react/useContext)
- [Optimizing re-renders when passing objects and functions – react.dev](https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions)
- [Scaling Up with Reducer and Context – react.dev](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [React 19: `<Context>` as a provider – react.dev](https://react.dev/blog/2024/12/05/react-19#context-as-a-provider)
- [`<Profiler>` – react.dev](https://react.dev/reference/react/Profiler)

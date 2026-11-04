# 22 – Testing React like a user

**Level:** Senior · **Time:** ~75 min

## Goal
This time the component is **finished**, and you write the tests. `UserSearch` debounces a search
box, fetches users, shows loading / empty / error states, retries and aborts stale requests. Your
job is to turn the `it.todo(...)` entries in **`UserSearch.test.tsx`** into a solid suite with React
Testing Library, user-event, fake timers, mocked `fetch` and `renderHook`.

## Concepts
- **The guiding principle.** *"The more your tests resemble the way your software is used, the more
  confidence they can give you."* Test **behaviour** (what the user sees and does), not
  **implementation details** (state variable names, which hook is used, how many times a function
  renders). A good test survives a refactor from `useState` to `useReducer`, or from an effect to
  TanStack Query.
- **Query priority** (Testing Library):
  1. `getByRole(role, { name })`, which mirrors the accessibility tree. It's your default, and it tests
     a11y for free (`searchbox`, `list`, `status`, `alert`, `button`…);
  2. `getByLabelText`, `getByPlaceholderText`, `getByText`, `getByDisplayValue`;
  3. `getByAltText`, `getByTitle`;
  4. `getByTestId`, the last resort for things users can't perceive.
  Scope with `within(list).getAllByRole('listitem')`.
- **getBy / queryBy / findBy**
  - `getBy*` throws if absent. Use it for things that must be there **now**.
  - `queryBy*` returns `null`. Use it **only** to assert absence (`.not.toBeInTheDocument()`).
  - `findBy*` returns a promise and retries (`waitFor` + `getBy`). Use it for things that **will**
    appear after async work.
  - `waitFor(() => expect(…))` retries an assertion. Keep a single assertion inside, and no side effects.
- **`user-event` vs `fireEvent`.** `fireEvent.change(input, …)` dispatches **one** synthetic DOM
  event. `userEvent.type(input, 'ada')` simulates a real user: focus, then `keydown`/`keypress`/`input`/
  `keyup` for each character, and it respects `disabled`, `pointer-events`, label clicks and so on.
  Always `const user = userEvent.setup()` at the start of the test, then `await user.…`.
- **Fake timers for debounce.** `vi.useFakeTimers({ shouldAdvanceTime: true })` and
  `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`, then move the clock with
  `act(() => vi.advanceTimersByTime(300))`. `act` makes React flush the state updates the timer
  triggered. Restore with `vi.useRealTimers()` in `afterEach`.
- **Controlling async.** Return a promise from your mock and resolve it **when you choose**
  (`await act(async () => resolve(data))`) to assert the "in flight" state. Use
  `mockResolvedValueOnce` / `mockRejectedValueOnce` for sequences.
- **Mocking the network, three levels**
  1. **Dependency injection**: `UserSearch` accepts a `search` prop. This is the simplest, and good for
     component tests.
  2. **Mock `fetch`**: `vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(data)))`.
     This also tests the real `searchUsers` (URL, encoding, JSON parsing).
  3. **MSW (Mock Service Worker)** intercepts requests at the network level with handlers like
     `http.get('/api/users', …)`. The code under test is untouched, the same handlers work in the
     browser, Vitest and Storybook, and it's the recommended approach for larger apps. (Not installed
     here: try it in a side project.)
- **Testing hooks.** Prefer testing a hook *through a component that uses it*. When a hook is a
  reusable unit on its own (`useDebouncedValue`), `renderHook(() => useX(), { initialProps })` gives
  you `result.current` and `rerender(newProps)`.
- **The `act` warning** (*"An update to X inside a test was not wrapped in act(…)"*) means state
  changed after your test stopped watching. RTL and user-event already wrap their calls. When you see
  it, you're usually missing an `await`, a `findBy`, or an `act` around a timer or promise you control.

## Tasks
Open **`UserSearch.test.tsx`** (read `UserSearch.tsx`, `useDebouncedValue.ts` and `api.ts` first).
Implement each `it.todo`, one at a time:

1. Renders a search box labelled *Search users* (role `searchbox`) and doesn't call `search` on mount.
2. **Debounce**: type `ada`, and `search` hasn't been called yet. Advance 300 ms: called **once**, with
   `'ada'` and an `AbortSignal` (`expect.any(AbortSignal)`).
3. **Loading**: with a search promise you resolve by hand, `role="status"` shows *Searching…*.
4. **Results**: after resolving, a `list` named *Results* contains one `listitem` per user.
5. **Empty**: `search` resolves `[]`, and the text *No users found for "zzz"* appears.
6. **Error + retry**: `mockRejectedValueOnce(...)` then `mockResolvedValueOnce(...)`. An `alert` shows
   the message, and clicking **Retry** shows the results.
7. **Abort**: type `a`, wait, type `l`, wait. The first call's signal is `aborted`, the second isn't.
8. **fetch mock**: render `<UserSearch />` with no `search` prop, mock `globalThis.fetch`, and assert the
   URL is `/api/users?q=alan%20turing` and the result is displayed.
9. **`useDebouncedValue`** with `renderHook`: the initial value comes back immediately, a new value
   arrives only after the delay, and a change within the delay restarts the timer.

## Check yourself
```bash
npm test -- UserSearch.test      # your suite
npm test -- 22-testing           # yours + the reference suite (exercise.test.tsx)
```
Unlike the other exercises, there's nothing "failing" to fix here. `exercise.test.tsx` is the
**reference solution** and already passes. Your own suite should pass too, and should **fail if you
break the component**. Try it: change the debounce to `0`, remove the `controller.abort()`, or
rename the label, and check that the right tests go red. A test that can't fail is worthless.

## Hints
<details><summary>Hint 1 – a controllable promise</summary>

```ts
let respond!: (users: User[]) => void
const search = vi.fn(() => new Promise<User[]>((r) => (respond = r)))
// … type + advance timers …
expect(screen.getByRole('status')).toHaveTextContent(/searching/i)
await act(async () => respond([ada]))
```
</details>
<details><summary>Hint 2 – reading the signal a mock received</summary>

`const [, signal] = search.mock.calls[0]`, then `expect(signal.aborted).toBe(true)`.
</details>
<details><summary>Hint 3 – my test hangs with fake timers</summary>

You probably called `userEvent.setup()` without `{ advanceTimers: vi.advanceTimersByTime }`, or
created the fake timers *after* `setup()`. user-event waits between keystrokes using timers.
</details>
<details><summary>Hint 4 – mocking fetch</summary>

```ts
const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
  new Response(JSON.stringify([alan]), { headers: { 'Content-Type': 'application/json' } }),
)
// …
expect(String(fetchSpy.mock.calls[0][0])).toBe('/api/users?q=alan%20turing')
```
Use `vi.restoreAllMocks()` in `afterEach`.
</details>

## Going further
- Install MSW and replace the `fetch` spy with a handler, `server.use(http.get('/api/users', …))`
  for per-test overrides.
- Add `jest-axe` / `vitest-axe` and assert `expect(await axe(container)).toHaveNoViolations()`.
- Go back to earlier exercises and read their `exercise.test.tsx` with a critical eye. Which ones test
  implementation details? (Exercise 15's render counting is a deliberate exception. Why is it
  acceptable there?)
- Write a Playwright end-to-end test for the same flow. What does it catch that jsdom can't?

## Sources
- [Guiding principles – Testing Library](https://testing-library.com/docs/guiding-principles)
- [Which query should I use? (priority) – Testing Library](https://testing-library.com/docs/queries/about/#priority)
- [user-event: introduction – Testing Library](https://testing-library.com/docs/user-event/intro)
- [Async methods: `findBy` / `waitFor` – Testing Library](https://testing-library.com/docs/dom-testing-library/api-async)
- [`renderHook` – React Testing Library API](https://testing-library.com/docs/react-testing-library/api/#renderhook)
- [Common mistakes with React Testing Library – Kent C. Dodds](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Implementation Details – Kent C. Dodds](https://kentcdodds.com/blog/testing-implementation-details)
- [Mock Service Worker (MSW) – documentation](https://mswjs.io/docs/)

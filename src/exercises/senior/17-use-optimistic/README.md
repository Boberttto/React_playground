# 17 – useOptimistic: instant UI, automatic rollback

**Level:** Senior · **Time:** ~40 min

## Goal
Make a like button and a chat thread feel **instant**. Show the user's change *before* the server
confirms it, and undo it automatically if the request fails. You'll use React 19's
**`useOptimistic`**, **Actions** (async transitions) and **form actions** (`<form action={fn}>`).

## Concepts
- **Optimistic UI**: most requests succeed, so render the expected result now and reconcile later.
  The hard part has always been the rollback. You had to remember the previous value, restore it on
  error, and handle races between overlapping requests.
- **Actions.** In React 19 a Transition may be `async`: `startTransition(async () => { … })`. React
  tracks it until the promise settles. That's an **Action**. `<form action={fn}>` and
  `useActionState` run your function as an Action for you, and pass it the form's `FormData`. After a
  successful form action, React **resets** uncontrolled fields.
- **`useOptimistic(state, reducer?)` → `[optimisticState, addOptimistic]`**
  - With no Action running, `optimisticState === state`.
  - Calling `addOptimistic(value)` **inside an Action** renders the optimistic state immediately (it
    "jumps the queue" of the Transition).
  - When the Action settles, React throws the optimistic layer away and renders the real `state`
    again. If you updated `state` with the server result, the UI stays as is. If the request failed and
    you didn't, it **rolls back by itself**, with no "previous value" to store.
  - The optional `reducer(currentState, value)` is re-applied on top of the *latest* real state. If
    `messages` changes during the Action (e.g. a websocket push), the optimistic item is re-appended,
    not lost.
  - Calling `addOptimistic` outside an Action logs a warning, and the value would revert right away.
- **The `await` gotcha.** After an `await` inside an Action, React can't (yet) tell that later
  `setState` calls belong to the same Transition. They'd run as urgent updates. Wrap them again:
  `startTransition(() => setState(…))`. The docs call this out explicitly, and it may go away once
  AsyncContext lands in JavaScript.
- **Design for failure.** Tell the user what happened (`role="alert"`), and style unconfirmed items
  differently (`Sending…`, reduced opacity) so the optimism is honest.

## Tasks
Open `Exercise.tsx`. `api.ts` is a fake backend. `sendMessage` fails when the text contains *fail*,
and every 3rd `toggleLike` call fails. Tests inject their own functions via `saveLike` / `send`.

**Part A – LikeButton**
1. `const [optimisticLike, setOptimisticLike] = useOptimistic(like)`.
2. Inside the Action, call `setOptimisticLike(next)` before awaiting `saveLike`.
3. After the `await`, wrap `setLike(next)` in `startTransition`.
4. In `catch`, set the error *"Could not save your like."* There's no manual rollback.
5. Render `optimisticLike` (pressed state and count) instead of `like`.

**Part B – MessageThread**

6. `useOptimistic(messages, reducer)`, where the reducer appends `{ id, text, sending: true }`.
   Type the optimistic list as `Message & { sending?: boolean }`.
7. Call `addOptimisticMessage(text)` at the start of `sendAction`. (A form action is already an
   Action, so no `startTransition` is needed here.)
8. Wrap the confirmed `setMessages` in `startTransition`.
9. On failure, show the error message in a `role="alert"` paragraph.
10. Render `optimisticMessages`, with a `<small>Sending…</small>` badge and `styles.sending` on
    unconfirmed items. Try typing *"this will fail"* in the playground.

## Check yourself
```bash
npm test -- 17-use-optimistic
```
The tests replace the API with promises they settle by hand. They assert the UI **while the request
is in flight** (optimistic), after it resolves (confirmed), and after it rejects (rolled back plus alert).

## Hints
<details><summary>Hint 1 – reducer signature</summary>

```ts
const [optimisticMessages, addOptimisticMessage] = useOptimistic(
  messages,
  (current: ShownMessage[], text: string) => [...current, { id: `optimistic-${current.length}`, text, sending: true }],
)
```
</details>
<details><summary>Hint 2 – "the optimistic value disappears instantly"</summary>

You're calling the setter outside an Action, or after the Action already finished. It must run
inside `startTransition(async () => …)` or inside a form action, *before* the `await`.
</details>
<details><summary>Hint 3 – why not just `setLike(next)` before the request?</summary>

You could, but then *you* own the rollback (`catch { setLike(previous) }`), and you have to reason
about two quick clicks where the first request fails after the second one succeeded.
`useOptimistic` keeps the source of truth (`like`) server-confirmed only.
</details>

## Going further
- Click the like button twice very fast. `next` is computed from the *confirmed* `like`, so both
  clicks compute the same `next`. Fix it with the reducer form:
  `useOptimistic(like, (cur, _: 'toggle') => ({ liked: !cur.liked, … }))`, and serialize requests.
- Rewrite the thread with `useActionState` to return `{ error }` from the action instead of using
  a separate `useState`.
- Add `useFormStatus()` in a child `<SubmitButton>` to disable it while the form is pending.

## Sources
- [`useOptimistic` – react.dev](https://react.dev/reference/react/useOptimistic)
- [React v19: Actions & `useOptimistic` – react.dev blog](https://react.dev/blog/2024/12/05/react-19)
- [`startTransition` (async functions and the `await` caveat) – react.dev](https://react.dev/reference/react/startTransition)
- [`<form>` with an `action` – react.dev](https://react.dev/reference/react-dom/components/form)
- [`useActionState` – react.dev](https://react.dev/reference/react/useActionState)
- [`useFormStatus` – react.dev](https://react.dev/reference/react-dom/hooks/useFormStatus)

# 21 – Portals & an accessible modal dialog

**Level:** Senior · **Time:** ~60 min

## Goal
Build a `Modal` that is genuinely accessible. It renders through **`createPortal`** into
`document.body`, moves focus in, **traps** <kbd>Tab</kbd>, closes on <kbd>Esc</kbd> and backdrop click,
**returns focus** to the trigger, locks page scroll and exposes the right ARIA. You'll also see how
React events bubble *through* portals.

## Concepts
- **Why a portal?** A modal rendered inline lives inside its parent's CSS context. An ancestor with
  `overflow: hidden`, `transform`, `filter` or its own `z-index` stacking context can clip it or bury it
  under other content. `createPortal(children, domNode)` renders the DOM somewhere else
  (`document.body`), so it escapes all of that.
- **Portals keep the React tree.** In the *React* tree the modal is still a child of its owner:
  - **context** flows into it (theme, i18n, router…);
  - **React events bubble along the React tree**, not the DOM tree. A click inside the modal triggers
    `onClick` on a React ancestor even though the DOM nodes aren't nested. (The demo counts clicks with
    `onClickCapture` on a wrapper.) That's usually what you want, but it's surprising if a parent has an
    "outside click" handler. Native `addEventListener` listeners follow the **DOM** tree instead.
- **The APG modal dialog pattern**
  - `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing to the visible title (ids via `useId`).
  - **Focus moves into** the dialog on open: the first focusable element, or the dialog itself
    (`tabIndex={-1}`).
  - **Focus is trapped**: <kbd>Tab</kbd> from the last element goes to the first, and
    <kbd>Shift+Tab</kbd> from the first goes to the last. `aria-modal` tells screen readers the
    background is inert, but it **doesn't** stop the Tab key.
  - <kbd>Escape</kbd> closes.
  - On close, **focus returns** to the element that opened it. Otherwise it falls to `<body>` and
    keyboard users lose their place.
  - The page behind shouldn't scroll (`overflow: hidden` on `body`, restoring the previous value).
- **Effects as synchronisation.** "While open, focus is inside, scroll is locked; when closed, undo
  it" maps exactly to one `useEffect` keyed on `open`, whose **cleanup** restores everything. The
  cleanup also runs if the modal unmounts while open, which a manual `onClose` handler wouldn't cover.
- **Backdrop clicks**: compare `e.target === e.currentTarget` so clicks *inside* the dialog don't close
  it. Use `mousedown` rather than `click`, so selecting text inside and releasing outside doesn't close it.
- **The native alternative: `<dialog>`.** `dialogRef.current.showModal()` gives you top-layer
  rendering (no portal or z-index wars), real background inertness, focus management and
  <kbd>Esc</kbd> for free. Listen to its `close` / `cancel` events to sync React state. Browser support is
  now universal. It's what you'd use in production. Here we build it by hand to understand what it does
  (and because jsdom doesn't implement `showModal`). See *Going further*.

## Tasks
Open `Exercise.tsx`. The starter just renders a `div` inline when `open` is true.

1. Return `createPortal(<backdrop>…</backdrop>, document.body)` (import from `react-dom`).
2. Add `role="dialog"`, `aria-modal="true"` and `aria-labelledby={titleId}`, with `id={titleId}`
   on the `<h2>`. Get `titleId` from `useId()`.
3. In a `useEffect` keyed on `open`, store `document.activeElement` and focus the first focusable
   element in the dialog (use a ref). In the cleanup, focus the stored element again.
4. In an `onKeyDown` on the dialog, call `onClose()` on `Escape`.
5. In the same handler, trap `Tab`: if focus is on the last focusable element (and not Shift), call
   `preventDefault()` and focus the first one, and vice-versa with Shift.
6. Close on a `mousedown` on the backdrop itself. Add `role="presentation"` to the backdrop: it's not a
   control for assistive tech.
7. Lock scroll in the same effect, saving and restoring `document.body.style.overflow`.
8. Try it in the playground with only the keyboard, and then with a screen reader.

## Check yourself
```bash
npm test -- 21-portal-modal
```
On the starter, two tests already pass: "renders nothing while closed" and "bubbles React events
through the portal". The latter holds with or without a portal, and that's the point: the React tree
is the same either way.

## Hints
<details><summary>Hint 1 – focusable elements</summary>

```ts
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const els = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
```
</details>
<details><summary>Hint 2 – focus in the effect</summary>

The effect runs after the portal's DOM is attached, so `dialogRef.current` exists. At that moment
`document.activeElement` is still the trigger button. Capture it **before** moving focus.
</details>
<details><summary>Hint 3 – Escape inside nested popovers</summary>

Call `e.stopPropagation()` when you handle Escape. Remember React events bubble through portals, so an
outer modal would otherwise close too.
</details>

## Going further
- Rewrite `Modal` on top of native `<dialog>` + `showModal()`, syncing `open` in an effect and
  calling `onClose` from the `close` event. In tests, polyfill:
  `HTMLDialogElement.prototype.showModal = function () { this.open = true }`.
- Make the rest of the page `inert` while open (`<main inert>`), the modern replacement for focus
  traps plus `aria-hidden` on siblings.
- Scroll lock causes a layout shift when the scrollbar disappears. Compensate with
  `padding-right` equal to `window.innerWidth - document.documentElement.clientWidth`.
- Stack two modals. What breaks? (Focus restoration order, scroll lock, Escape.)

## Sources
- [`createPortal` – react.dev](https://react.dev/reference/react-dom/createPortal)
- [Dialog (Modal) pattern – WAI-ARIA APG (W3C)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [`aria-modal` – MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-modal)
- [`<dialog>`: the Dialog element – MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [`inert` global attribute – MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert)
- [Synchronizing with Effects – react.dev](https://react.dev/learn/synchronizing-with-effects)

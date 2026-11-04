// 21 – Portal & accessible modal (solution).
import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './styles.module.scss'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
}

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    // 1. Remember who opened us. Usually the trigger button, which still has focus here.
    const previouslyFocused = document.activeElement as HTMLElement | null

    // 2. Move focus INTO the dialog. Otherwise a keyboard / screen-reader user stays on the
    //    page behind it, which is invisible and inert to them.
    const dialog = dialogRef.current!
    ;(getFocusable(dialog)[0] ?? dialog).focus()

    // 3. Scroll lock: the page behind a modal shouldn't scroll. Save the previous value so
    //    we restore exactly what was there (another modal may have set it too).
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // The cleanup runs when `open` becomes false OR when the Modal unmounts.
    return () => {
      document.body.style.overflow = previousOverflow
      // 4. Give focus back. Without this, focus falls to <body> and the keyboard user
      //    loses their place in the page.
      previouslyFocused?.focus()
    }
  }, [open])

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation() // a modal inside a modal: only the top one closes
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    // Focus trap: aria-modal tells assistive tech the rest is inert, but it does NOT stop
    // the Tab key. We wrap focus manually from last → first (and first → last with Shift).
    const focusable = getFocusable(dialogRef.current!)
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  function handleBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    // Only a press that STARTS on the backdrop itself closes the modal. Using mousedown (not
    // click) avoids closing when the user selects text inside and releases outside.
    if (e.target === e.currentTarget) onClose()
  }

  if (!open) return null

  // createPortal renders the DOM under <body>, out of any `overflow: hidden`, `transform` or
  // z-index stacking context of the parent. But in the REACT tree the modal is still a child of
  // its owner: context flows in and React events (onClick, onKeyDown…) bubble up through the
  // portal to React ancestors, even though the DOM nodes aren't nested.
  return createPortal(
    // The backdrop is purely presentational for assistive tech: Escape and the Close button
    // are the accessible ways out. Mouse users get "click outside" as a convenience.
    <div className={styles.backdrop} role="presentation" onMouseDown={handleBackdropMouseDown}>
      {/* A hand-rolled dialog on purpose, to learn what native <dialog> does for you (see README). */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={dialogRef}
        // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1} // focus fallback when the dialog has no focusable content
        className={styles.dialog}
        onKeyDown={handleKeyDown}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {children}
        <button type="button" className={`btn ${styles.close}`} aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>,
    document.body,
  )
}

export default function SolutionDemo() {
  const [open, setOpen] = useState(false)
  const [clicks, setClicks] = useState(0)

  return (
    <div className={styles.demo} onClickCapture={() => setClicks((c) => c + 1)}>
      <p>Clicks seen by the wrapper (including inside the modal): {clicks}</p>
      <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
        Edit profile
      </button>
      <div className={styles.filler} aria-hidden="true" />
      <Modal open={open} onClose={() => setOpen(false)} title="Edit profile">
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            setOpen(false)
          }}
        >
          <label className={styles.field}>
            Name
            <input className="input" defaultValue="Ada Lovelace" />
          </label>
          <label className={styles.field}>
            Email
            <input className="input" type="email" defaultValue="ada@example.com" />
          </label>
          <div className={styles.actions}>
            <button type="button" className="btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

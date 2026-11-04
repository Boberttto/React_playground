// 21 – Portal & accessible modal. Instructions: see README.md (or the "Instructions" tab).
import { useState, type ReactNode } from 'react'
import styles from './styles.module.scss'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  // TODO 1: render through createPortal(…, document.body) instead of inline
  // TODO 2: role="dialog", aria-modal="true", aria-labelledby → the <h2> (useId)
  // TODO 3: on open, remember document.activeElement and move focus to the first focusable
  //         element inside the dialog; on close, restore focus to the remembered element
  // TODO 4: Escape → onClose()
  // TODO 5: trap Tab / Shift+Tab inside the dialog
  // TODO 6: mousedown on the backdrop (not on the dialog) → onClose()
  // TODO 7: lock page scroll (document.body.style.overflow = 'hidden') while open, then restore
  if (!open) return null
  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        <h2 className={styles.title}>{title}</h2>
        {children}
        <button type="button" className={`btn ${styles.close}`} aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  )
}

export default function ExerciseDemo() {
  const [open, setOpen] = useState(false)
  const [clicks, setClicks] = useState(0)

  return (
    // React events bubble along the REACT tree, so clicks inside the portal reach this div.
    <div className={styles.demo} onClickCapture={() => setClicks((c) => c + 1)}>
      <p>Clicks seen by the wrapper (including inside the modal): {clicks}</p>
      <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
        Edit profile
      </button>
      {/* A long page so you can check the scroll lock. */}
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

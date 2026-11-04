import { useEffect, useState } from 'react'

/** Returns `value`, but only after it stopped changing for `delayMs`. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    // Each new value cancels the previous timer → only the last one "wins".
    return () => clearTimeout(id)
  }, [value, delayMs])

  return debounced
}

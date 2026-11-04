import { useSyncExternalStore } from 'react'

/**
 * A ~15 line hash router built on useSyncExternalStore.
 * The playground shell deliberately does NOT use react-router so that
 * exercise 12 can mount its own router without nesting conflicts.
 * https://react.dev/reference/react/useSyncExternalStore
 */

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function getSnapshot() {
  return window.location.hash.replace(/^#\/?/, '')
}

export function useHashPath() {
  return useSyncExternalStore(subscribe, getSnapshot, () => '')
}

export function hrefTo(path: string) {
  return `#/${path}`
}

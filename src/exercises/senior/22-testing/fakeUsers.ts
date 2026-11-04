import type { User } from './api'

const USERS: User[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  { id: 3, name: 'Grace Hopper', email: 'grace@example.com' },
  { id: 4, name: 'Margaret Hamilton', email: 'margaret@example.com' },
  { id: 5, name: 'Linus Torvalds', email: 'linus@example.com' },
]

/** In-memory stand-in for the API, used by the playground demo. Type "error" to fail. */
export function fakeSearch(query: string, signal: AbortSignal): Promise<User[]> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      if (/error/i.test(query)) reject(new Error('The fake server is having a bad day'))
      else resolve(USERS.filter((u) => u.name.toLowerCase().includes(query.toLowerCase())))
    }, 600)
    signal.addEventListener('abort', () => {
      clearTimeout(id)
      reject(signal.reason)
    })
  })
}

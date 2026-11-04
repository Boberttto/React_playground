export type User = { id: number; name: string; email: string }

/**
 * Real network call (there is no such endpoint in the playground: tests mock `fetch`,
 * and the demo injects a fake `search` function instead).
 */
export async function searchUsers(query: string, signal?: AbortSignal): Promise<User[]> {
  const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`, { signal })
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
  return res.json()
}

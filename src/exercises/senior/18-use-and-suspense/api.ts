// Fake backend with NO caching: every call starts a new "request" and returns a NEW promise.
export type User = { id: number; name: string; bio: string }
export type Post = { id: number; title: string }

const USERS: Record<number, User> = {
  1: { id: 1, name: 'Ada Lovelace', bio: 'Wrote the first published algorithm.' },
  2: { id: 2, name: 'Alan Turing', bio: 'Asked whether machines can think.' },
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchUser(id: number): Promise<User> {
  console.info(`[api] GET /users/${id}`)
  await wait(800)
  const user = USERS[id]
  if (!user) throw new Error(`User ${id} not found`)
  return user
}

export async function fetchPosts(userId: number): Promise<Post[]> {
  console.info(`[api] GET /users/${userId}/posts`)
  await wait(1600)
  return Array.from({ length: 3 }, (_, i) => ({ id: userId * 10 + i, title: `Post ${i + 1} by user ${userId}` }))
}

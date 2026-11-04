// A tiny fake backend so loaders have something async to await.
export type User = {
  id: string
  name: string
  email: string
  title: string
}

const USERS: User[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', title: 'Analyst' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com', title: 'Rear Admiral' },
  { id: '3', name: 'Alan Turing', email: 'alan@example.com', title: 'Cryptanalyst' },
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchUsers(): Promise<User[]> {
  await wait(100)
  return USERS
}

export async function fetchUser(id: string): Promise<User | undefined> {
  await wait(100)
  return USERS.find((user) => user.id === id)
}

// Fake backend. Network latency is simulated with setTimeout.
export type Message = { id: string; text: string }

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let nextId = 1

/** Fails when the text contains "fail", so you can watch the rollback. */
export async function sendMessage(text: string): Promise<Message> {
  await wait(1000)
  if (/fail/i.test(text)) throw new Error(`The server rejected “${text}”.`)
  return { id: `msg-${nextId++}`, text }
}

let likeCalls = 0

/** Every third call fails, so you can see the like button roll back. */
export async function toggleLike(liked: boolean): Promise<boolean> {
  await wait(800)
  likeCalls += 1
  if (likeCalls % 3 === 0) throw new Error('Network error')
  return liked
}

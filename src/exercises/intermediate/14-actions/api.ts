// A fake "server" for the newsletter. Pretend every call goes over the network.

/** Errors the server reports on purpose (validation, conflicts) — safe to show to the user. */
export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const INITIAL_SUBSCRIBERS = ['ada@example.com']
const BLOCKED_DOMAINS = ['spam.test']

let subscribers = new Set(INITIAL_SUBSCRIBERS)

/** Test helper: restore the initial list of subscribers. */
export function resetSubscribers() {
  subscribers = new Set(INITIAL_SUBSCRIBERS)
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function subscribeToNewsletter(email: string): Promise<void> {
  await wait(400)
  const normalized = email.toLowerCase()
  const domain = normalized.split('@')[1] ?? ''

  if (BLOCKED_DOMAINS.includes(domain)) {
    throw new ApiError('This email provider is not allowed.')
  }
  if (subscribers.has(normalized)) {
    throw new ApiError(`${email} is already subscribed.`)
  }
  subscribers.add(normalized)
}

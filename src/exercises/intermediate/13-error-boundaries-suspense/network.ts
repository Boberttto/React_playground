// Local dev servers are too fast to notice a Suspense fallback; this adds artificial latency.
export function simulateSlowNetwork<T>(promise: Promise<T>, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(resolve, ms)).then(() => promise)
}

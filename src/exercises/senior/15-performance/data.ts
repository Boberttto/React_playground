export type Product = { id: number; name: string; price: number }

const ADJECTIVES = ['Red', 'Blue', 'Quiet', 'Rapid', 'Tiny', 'Giant', 'Smart', 'Retro', 'Solar', 'Wooden']
const NOUNS = ['Lamp', 'Chair', 'Keyboard', 'Mug', 'Backpack', 'Speaker', 'Notebook', 'Bottle', 'Clock', 'Plant']

// Deterministic fake catalogue (no Math.random → same list on every reload).
export const PRODUCTS: Product[] = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  name: `${ADJECTIVES[i % 10]} ${NOUNS[Math.floor(i / 10) % 10]} #${i + 1}`,
  price: ((i * 37) % 200) + 5,
}))

/** Busy-waits for `ms` milliseconds to simulate an expensive render. Pure: no side effects. */
export function slowDown(ms: number) {
  const end = performance.now() + ms
  while (performance.now() < end) {
    // burn CPU on purpose
  }
}

/**
 * Seed-based PRNG using the mulberry32 algorithm.
 * Returns deterministic sequences for the same seed.
 */
export function createRNG(seed: number) {
  let state = seed | 0;

  function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function pickOne<T>(items: readonly T[]): T {
    const index = Math.floor(next() * items.length);
    return items[index];
  }

  return { next, pickOne };
}

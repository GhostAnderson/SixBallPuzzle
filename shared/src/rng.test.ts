import { describe, it, expect } from 'vitest';
import { createRNG } from './rng';

describe('createRNG', () => {
  it('returns deterministic sequence for same seed', () => {
    const rng1 = createRNG(12345);
    const rng2 = createRNG(12345);
    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());
    expect(seq1).toEqual(seq2);
  });

  it('returns different sequences for different seeds', () => {
    const rng1 = createRNG(12345);
    const rng2 = createRNG(99999);
    const seq1 = Array.from({ length: 5 }, () => rng1.next());
    const seq2 = Array.from({ length: 5 }, () => rng2.next());
    expect(seq1).not.toEqual(seq2);
  });

  it('returns values between 0 and 1', () => {
    const rng = createRNG(42);
    for (let i = 0; i < 100; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('pickOne returns element from array', () => {
    const rng = createRNG(42);
    const colors = ['red', 'blue', 'green'];
    const picked = rng.pickOne(colors);
    expect(colors).toContain(picked);
  });

  it('pickOne returns deterministic results', () => {
    const rng1 = createRNG(77);
    const rng2 = createRNG(77);
    const colors = ['red', 'purple', 'yellow', 'blue', 'green'];
    expect(rng1.pickOne(colors)).toBe(rng2.pickOne(colors));
  });

  it('next returns expected first value for mulberry32 seed 0', () => {
    const rng = createRNG(0);
    expect(rng.next()).toBeCloseTo(0.26642920868471265, 10);
  });
});

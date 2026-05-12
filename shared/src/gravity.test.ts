import { describe, it, expect } from 'vitest';
import { applyGravity } from './gravity';
import { createEmptyGrid, setBall, getBall } from './grid';
import type { Ball } from './types';

describe('gravity', () => {
  describe('single ball falling', () => {
    it('ball falls to bottom of empty grid', () => {
      const grid = createEmptyGrid();
      const ball: Ball = { color: 'red', position: { row: 5, col: 5 } };
      setBall(grid, { row: 5, col: 5 }, ball);

      const newGrid = applyGravity(grid);

      expect(getBall(newGrid, { row: 5, col: 5 })).toBeNull();
      expect(getBall(newGrid, { row: 0, col: 5 })).not.toBeNull();
      expect(getBall(newGrid, { row: 0, col: 5 })?.color).toBe('red');
    });

    it('ball on bottom row stays in place', () => {
      const grid = createEmptyGrid();
      const ball: Ball = { color: 'blue', position: { row: 0, col: 3 } };
      setBall(grid, { row: 0, col: 3 }, ball);

      const newGrid = applyGravity(grid);

      expect(getBall(newGrid, { row: 0, col: 3 })).not.toBeNull();
      expect(getBall(newGrid, { row: 0, col: 3 })?.color).toBe('blue');
    });
  });
});

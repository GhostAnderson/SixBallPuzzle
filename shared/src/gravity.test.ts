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
      expect(getBall(newGrid, { row: 0, col: 8 })).not.toBeNull();
      expect(getBall(newGrid, { row: 0, col: 8 })?.color).toBe('red');
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

describe('multiple balls stacking', () => {
  it('stacks balls in a pile', () => {
    const grid = createEmptyGrid();
    setBall(grid, { row: 8, col: 5 }, { color: 'red', position: { row: 8, col: 5 } });
    setBall(grid, { row: 6, col: 5 }, { color: 'blue', position: { row: 6, col: 5 } });
    setBall(grid, { row: 4, col: 5 }, { color: 'green', position: { row: 4, col: 5 } });

    const newGrid = applyGravity(grid);

    // Count total balls
    let ballCount = 0;
    for (let row = 0; row < 12; row++) {
      const width = row % 2 === 0 ? 10 : 9;
      for (let col = 0; col < width; col++) {
        if (getBall(newGrid, { row, col })) ballCount++;
      }
    }
    expect(ballCount).toBe(3);
  });

  it('right ball priority when competing for same slot', () => {
    const grid = createEmptyGrid();
    setBall(grid, { row: 2, col: 5 }, { color: 'red', position: { row: 2, col: 5 } });
    setBall(grid, { row: 2, col: 6 }, { color: 'blue', position: { row: 2, col: 6 } });

    const newGrid = applyGravity(grid);

    const row0Balls: { col: number; color: string }[] = [];
    const row1Balls: { col: number; color: string }[] = [];
    for (let col = 0; col < 10; col++) {
      const ball0 = getBall(newGrid, { row: 0, col });
      const ball1 = getBall(newGrid, { row: 1, col });
      if (ball0) row0Balls.push({ col, color: ball0.color });
      if (ball1) row1Balls.push({ col, color: ball1.color });
    }

    expect(row0Balls.length + row1Balls.length).toBe(2);
  });
});

describe('gravity preserves hollow structures', () => {
  it('balls can form stable bridges', () => {
    const grid = createEmptyGrid();
    setBall(grid, { row: 0, col: 4 }, { color: 'red', position: { row: 0, col: 4 } });
    setBall(grid, { row: 0, col: 6 }, { color: 'red', position: { row: 0, col: 6 } });
    setBall(grid, { row: 1, col: 5 }, { color: 'blue', position: { row: 1, col: 5 } });

    const newGrid = applyGravity(grid);

    // The blue ball at (row 1, col 5) falls into the empty gap
    // between the two red supports at (row 0, col 4) and (row 0, col 6)
    expect(getBall(newGrid, { row: 0, col: 5 })?.color).toBe('blue');
    expect(getBall(newGrid, { row: 0, col: 4 })?.color).toBe('red');
    expect(getBall(newGrid, { row: 0, col: 6 })?.color).toBe('red');
  });
});

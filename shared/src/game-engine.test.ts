import { describe, it, expect } from 'vitest';
import { clearPattern, processBoard } from './game-engine';
import { createEmptyGrid, setBall, getBall } from './grid';
import type { Ball, PatternMatch } from './types';

describe('clearPattern', () => {
  it('removes matched balls from grid', () => {
    const grid = createEmptyGrid();
    setBall(grid, { row: 0, col: 0 }, { color: 'red', position: { row: 0, col: 0 } });
    setBall(grid, { row: 0, col: 1 }, { color: 'red', position: { row: 0, col: 1 } });

    const match: PatternMatch = {
      type: 'sixConnected',
      color: 'red',
      positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
    };

    const result = clearPattern(grid, match);
    expect(getBall(result, { row: 0, col: 0 })).toBeNull();
    expect(getBall(result, { row: 0, col: 1 })).toBeNull();
  });

  it('does not remove balls outside match positions', () => {
    const grid = createEmptyGrid();
    setBall(grid, { row: 0, col: 0 }, { color: 'red', position: { row: 0, col: 0 } });
    setBall(grid, { row: 0, col: 2 }, { color: 'blue', position: { row: 0, col: 2 } });

    const match: PatternMatch = {
      type: 'sixConnected',
      color: 'red',
      positions: [{ row: 0, col: 0 }],
    };

    const result = clearPattern(grid, match);
    expect(getBall(result, { row: 0, col: 0 })).toBeNull();
    expect(getBall(result, { row: 0, col: 2 })).not.toBeNull();
  });
});

describe('processBoard', () => {
  it('returns grid and empty attacks when no patterns exist', () => {
    const grid = createEmptyGrid();
    const result = processBoard(grid);
    expect(result.attacks).toEqual([]);
  });

  it('processes chain reactions', () => {
    const grid = createEmptyGrid();
    // Place 6 connected red balls
    for (let col = 0; col < 6; col++) {
      setBall(grid, { row: 0, col }, { color: 'red', position: { row: 0, col } });
    }

    const result = processBoard(grid);
    // All red balls should be cleared
    for (let col = 0; col < 6; col++) {
      expect(getBall(result.grid, { row: 0, col })).toBeNull();
    }
  });
});

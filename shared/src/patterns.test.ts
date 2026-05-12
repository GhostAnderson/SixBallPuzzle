import { describe, it, expect } from 'vitest';
import { findSixConnected, findSixLine } from './patterns';
import { createEmptyGrid, setBall } from './grid';
import type { Ball } from './types';

describe('findSixConnected', () => {
  it('returns empty array for empty grid', () => {
    const grid = createEmptyGrid();
    const matches = findSixConnected(grid);
    expect(matches).toEqual([]);
  });

  it('returns empty array for 5 connected balls', () => {
    const grid = createEmptyGrid();
    const positions = [
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
      { row: 0, col: 3 }, { row: 0, col: 4 },
    ];
    positions.forEach(pos => {
      setBall(grid, pos, { color: 'red', position: pos } as Ball);
    });
    const matches = findSixConnected(grid);
    expect(matches).toEqual([]);
  });

  it('finds 6 connected balls in a row', () => {
    const grid = createEmptyGrid();
    const positions = [
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
      { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 },
    ];
    positions.forEach(pos => {
      setBall(grid, pos, { color: 'red', position: pos } as Ball);
    });
    const matches = findSixConnected(grid);
    expect(matches).toHaveLength(1);
    expect(matches[0].type).toBe('sixConnected');
    expect(matches[0].color).toBe('red');
    expect(matches[0].positions).toHaveLength(6);
  });

  it('does not match different colors', () => {
    const grid = createEmptyGrid();
    setBall(grid, { row: 0, col: 0 }, { color: 'red', position: { row: 0, col: 0 } } as Ball);
    setBall(grid, { row: 0, col: 1 }, { color: 'red', position: { row: 0, col: 1 } } as Ball);
    setBall(grid, { row: 0, col: 2 }, { color: 'red', position: { row: 0, col: 2 } } as Ball);
    setBall(grid, { row: 0, col: 3 }, { color: 'blue', position: { row: 0, col: 3 } } as Ball);
    setBall(grid, { row: 0, col: 4 }, { color: 'blue', position: { row: 0, col: 4 } } as Ball);
    setBall(grid, { row: 0, col: 5 }, { color: 'blue', position: { row: 0, col: 5 } } as Ball);
    const matches = findSixConnected(grid);
    expect(matches).toEqual([]);
  });
});

describe('findSixLine', () => {
  it('returns empty array for empty grid', () => {
    const grid = createEmptyGrid();
    const matches = findSixLine(grid);
    expect(matches).toEqual([]);
  });

  it('finds horizontal six-line', () => {
    const grid = createEmptyGrid();
    for (let col = 0; col < 6; col++) {
      setBall(grid, { row: 0, col }, { color: 'red', position: { row: 0, col } });
    }
    const matches = findSixLine(grid);
    expect(matches).toHaveLength(1);
    expect(matches[0].type).toBe('sixLine');
    expect(matches[0].color).toBe('red');
  });

  it('does not match 5 in a line', () => {
    const grid = createEmptyGrid();
    for (let col = 0; col < 5; col++) {
      setBall(grid, { row: 0, col }, { color: 'red', position: { row: 0, col } });
    }
    const matches = findSixLine(grid);
    expect(matches).toEqual([]);
  });

  it('finds diagonal six-line (upper-left to lower-right)', () => {
    const grid = createEmptyGrid();
    // UpperRight diagonal: (0,2) -> (1,2) -> (2,3) -> (3,3) -> (4,4) -> (5,4)
    const positions = [
      { row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 3 },
      { row: 3, col: 3 }, { row: 4, col: 4 }, { row: 5, col: 4 },
    ];
    positions.forEach(pos => {
      setBall(grid, pos, { color: 'blue', position: pos });
    });

    const matches = findSixLine(grid);
    expect(matches).toHaveLength(1);
    expect(matches[0].type).toBe('sixLine');
  });
});

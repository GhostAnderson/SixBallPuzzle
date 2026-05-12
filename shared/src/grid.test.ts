import { describe, it, expect } from 'vitest';
import { isValidPosition, getRowWidth, getNeighbors } from './grid';

describe('grid', () => {
  describe('getRowWidth', () => {
    it('returns 10 for even rows', () => {
      expect(getRowWidth(0)).toBe(10);
      expect(getRowWidth(2)).toBe(10);
      expect(getRowWidth(10)).toBe(10);
    });

    it('returns 9 for odd rows', () => {
      expect(getRowWidth(1)).toBe(9);
      expect(getRowWidth(3)).toBe(9);
      expect(getRowWidth(11)).toBe(9);
    });
  });

  describe('isValidPosition', () => {
    it('accepts valid positions in even rows', () => {
      expect(isValidPosition({ row: 0, col: 0 })).toBe(true);
      expect(isValidPosition({ row: 0, col: 9 })).toBe(true);
      expect(isValidPosition({ row: 2, col: 5 })).toBe(true);
    });

    it('accepts valid positions in odd rows', () => {
      expect(isValidPosition({ row: 1, col: 0 })).toBe(true);
      expect(isValidPosition({ row: 1, col: 8 })).toBe(true);
      expect(isValidPosition({ row: 3, col: 4 })).toBe(true);
    });

    it('rejects positions outside grid height', () => {
      expect(isValidPosition({ row: -1, col: 0 })).toBe(false);
      expect(isValidPosition({ row: 12, col: 0 })).toBe(false);
    });

    it('rejects positions outside row width', () => {
      expect(isValidPosition({ row: 0, col: -1 })).toBe(false);
      expect(isValidPosition({ row: 0, col: 10 })).toBe(false);
      expect(isValidPosition({ row: 1, col: 9 })).toBe(false);
    });
  });

  describe('getNeighbors', () => {
    it('returns 6 neighbors for center position in even row', () => {
      const neighbors = getNeighbors({ row: 2, col: 5 });
      expect(neighbors).toHaveLength(6);

      expect(neighbors).toContainEqual({ row: 3, col: 4 });  // upper-left
      expect(neighbors).toContainEqual({ row: 3, col: 5 });  // upper-right
      expect(neighbors).toContainEqual({ row: 2, col: 4 });  // left
      expect(neighbors).toContainEqual({ row: 2, col: 6 });  // right
      expect(neighbors).toContainEqual({ row: 1, col: 4 });  // lower-left
      expect(neighbors).toContainEqual({ row: 1, col: 5 });  // lower-right
    });

    it('returns 6 neighbors for center position in odd row', () => {
      const neighbors = getNeighbors({ row: 3, col: 4 });
      expect(neighbors).toHaveLength(6);

      expect(neighbors).toContainEqual({ row: 4, col: 4 });  // upper-left
      expect(neighbors).toContainEqual({ row: 4, col: 5 });  // upper-right
      expect(neighbors).toContainEqual({ row: 3, col: 3 });  // left
      expect(neighbors).toContainEqual({ row: 3, col: 5 });  // right
      expect(neighbors).toContainEqual({ row: 2, col: 4 });  // lower-left
      expect(neighbors).toContainEqual({ row: 2, col: 5 });  // lower-right
    });

    it('filters out invalid positions at edges', () => {
      const neighbors = getNeighbors({ row: 0, col: 0 });
      neighbors.forEach(n => {
        expect(isValidPosition(n)).toBe(true);
      });
      expect(neighbors.length).toBeLessThan(6);
    });

    it('filters out invalid positions at top', () => {
      const neighbors = getNeighbors({ row: 11, col: 4 });
      neighbors.forEach(n => {
        expect(isValidPosition(n)).toBe(true);
      });
    });
  });
});

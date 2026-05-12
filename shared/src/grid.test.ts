import { describe, it, expect } from 'vitest';
import { isValidPosition, getRowWidth } from './grid';

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
});

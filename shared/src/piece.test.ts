import { describe, it, expect } from 'vitest';
import { getPieceBallPositions } from './piece';
import type { TrianglePiece } from './types';

describe('getPieceBallPositions', () => {
  it('returns 3 positions for rotation 0 (point up)', () => {
    const piece: TrianglePiece = {
      position: { row: 2, col: 5 },
      rotation: 0,
      colors: ['red', 'blue', 'green'],
    };
    const positions = getPieceBallPositions(piece);
    expect(positions).toHaveLength(3);
  });

  it('rotation 0: top ball is above, two balls below', () => {
    const piece: TrianglePiece = {
      position: { row: 2, col: 5 },
      rotation: 0,
      colors: ['red', 'blue', 'green'],
    };
    const positions = getPieceBallPositions(piece);

    expect(positions[0]).toEqual({ row: 3, col: 5 });
    expect(positions[1]).toEqual({ row: 2, col: 4 });
    expect(positions[2]).toEqual({ row: 2, col: 5 });
  });

  it('rotation 3: triangle points down (inverted)', () => {
    const piece: TrianglePiece = {
      position: { row: 2, col: 5 },
      rotation: 3,
      colors: ['red', 'blue', 'green'],
    };
    const positions = getPieceBallPositions(piece);

    expect(positions[0]).toEqual({ row: 1, col: 4 });
    expect(positions[1]).toEqual({ row: 2, col: 5 });
    expect(positions[2]).toEqual({ row: 2, col: 4 });
  });
});

import { describe, it, expect } from 'vitest';
import {
  getPieceBallPositions,
  movePiece,
  rotatePiece,
  canPlacePiece,
} from './piece';
import { createEmptyGrid, setBall } from './grid';
import type { TrianglePiece, Ball } from './types';

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

describe('movePiece', () => {
  it('moves piece left', () => {
    const piece: TrianglePiece = {
      position: { row: 5, col: 5 },
      rotation: 0,
      colors: ['red', 'blue', 'green'],
    };
    const moved = movePiece(piece, 'left');
    expect(moved.position).toEqual({ row: 5, col: 4 });
    expect(moved.rotation).toBe(0);
    expect(moved.colors).toEqual(['red', 'blue', 'green']);
  });

  it('moves piece right', () => {
    const piece: TrianglePiece = {
      position: { row: 5, col: 5 },
      rotation: 0,
      colors: ['red', 'blue', 'green'],
    };
    const moved = movePiece(piece, 'right');
    expect(moved.position).toEqual({ row: 5, col: 6 });
  });

  it('moves piece down', () => {
    const piece: TrianglePiece = {
      position: { row: 5, col: 5 },
      rotation: 0,
      colors: ['red', 'blue', 'green'],
    };
    const moved = movePiece(piece, 'down');
    expect(moved.position).toEqual({ row: 4, col: 5 });
  });
});

describe('rotatePiece', () => {
  it('rotates clockwise from 0 to 1', () => {
    const piece: TrianglePiece = {
      position: { row: 5, col: 5 },
      rotation: 0,
      colors: ['red', 'blue', 'green'],
    };
    const rotated = rotatePiece(piece);
    expect(rotated.rotation).toBe(1);
  });

  it('wraps from 5 to 0', () => {
    const piece: TrianglePiece = {
      position: { row: 5, col: 5 },
      rotation: 5,
      colors: ['red', 'blue', 'green'],
    };
    const rotated = rotatePiece(piece);
    expect(rotated.rotation).toBe(0);
  });
});

describe('canPlacePiece', () => {
  it('returns true for valid empty positions', () => {
    const grid = createEmptyGrid();
    const piece: TrianglePiece = {
      position: { row: 5, col: 5 },
      rotation: 0,
      colors: ['red', 'blue', 'green'],
    };
    expect(canPlacePiece(grid, piece)).toBe(true);
  });

  it('returns false when a ball position is occupied', () => {
    const grid = createEmptyGrid();
    const ball: Ball = { color: 'purple', position: { row: 5, col: 5 } };
    setBall(grid, { row: 5, col: 5 }, ball);

    const piece: TrianglePiece = {
      position: { row: 4, col: 5 },
      rotation: 0,
      colors: ['red', 'blue', 'green'],
    };
    expect(canPlacePiece(grid, piece)).toBe(false);
  });

  it('returns false when ball position is out of bounds', () => {
    const grid = createEmptyGrid();
    const piece: TrianglePiece = {
      position: { row: 0, col: 0 },
      rotation: 3,
      colors: ['red', 'blue', 'green'],
    };
    expect(canPlacePiece(grid, piece)).toBe(false);
  });
});

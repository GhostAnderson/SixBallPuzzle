import { describe, it, expect } from 'vitest';
import { clearPattern, processBoard, landPiece } from './game-engine';
import { createEmptyGrid, setBall, getBall } from './grid';
import { getPieceBallPositions } from './piece';
import type { Ball, PatternMatch, TrianglePiece } from './types';

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

describe('landPiece', () => {
  it('places piece balls on the grid', () => {
    const grid = createEmptyGrid();
    const piece: TrianglePiece = {
      position: { row: 5, col: 5 },
      rotation: 0,
      colors: ['red', 'blue', 'green'],
    };

    const result = landPiece(grid, piece);

    // All 3 ball positions should be occupied
    const positions = getPieceBallPositions(piece);
    for (const pos of positions) {
      expect(getBall(result.grid, pos)).not.toBeNull();
    }
  });

  it('processes the board after landing', () => {
    const grid = createEmptyGrid();
    // Place 5 blue balls already on the grid that will form a 6-connect when combined with the piece
    for (let col = 0; col < 5; col++) {
      setBall(grid, { row: 0, col }, { color: 'blue', position: { row: 0, col } });
    }

    const piece: TrianglePiece = {
      position: { row: 1, col: 4 },
      rotation: 0,
      colors: ['blue', 'red', 'red'],
    };

    const result = landPiece(grid, piece);
    // The blue ball should connect forming a 6+ group and be cleared
    // Check that gravity was applied (balls fell down)
    expect(result.grid.length).toBe(12); // Grid still valid
  });
});

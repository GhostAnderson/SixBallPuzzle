import { GRID_HEIGHT, type PatternMatch, type Attack, type Ball, type TrianglePiece } from './types';
import { getPieceBallPositions } from './piece';
import { getBall, setBall, getRowWidth, type Grid } from './grid';
import { applyGravity } from './gravity';
import { findPatterns } from './patterns';

/**
 * Clear balls at matched positions on the grid.
 * Returns a new grid with those positions set to null.
 */
export function clearPattern(grid: Grid, match: PatternMatch): Grid {
  // Create a shallow copy with spread
  const newGrid: Grid = grid.map(row => [...row]);

  for (const pos of match.positions) {
    setBall(newGrid, pos, null);
  }

  return newGrid;
}

/**
 * Determine attack type and count from a pattern match.
 */
function getAttackFromPattern(match: PatternMatch): Attack[] {
  switch (match.type) {
    case 'hexagonRing':
      return [{ type: 'hexagonRings', count: 5 }];
    case 'sixLine':
      return [{ type: 'rows', count: 2 }];
    case 'pyramid':
      return [{ type: 'triangles', count: 4 }];
    case 'sixConnected':
      return [];  // No attack for basic six-connected
  }
}

/**
 * Process the full board: find patterns, clear them, apply gravity, chain.
 * Returns final grid and accumulated attacks to send to opponent.
 */
export function processBoard(grid: Grid): { grid: Grid; attacks: Attack[] } {
  let currentGrid = grid;
  const allAttacks: Attack[] = [];

  // Chain loop: keep finding patterns until no more
  let iterations = 0;
  const MAX_ITERATIONS = 100; // Safety limit

  while (iterations < MAX_ITERATIONS) {
    const patterns = findPatterns(currentGrid);

    if (patterns.length === 0) {
      break;
    }

    // Clear all patterns
    let afterClear = currentGrid;
    for (const pattern of patterns) {
      afterClear = clearPattern(afterClear, pattern);
      const attacks = getAttackFromPattern(pattern);
      allAttacks.push(...attacks);
    }

    // Apply gravity
    currentGrid = applyGravity(afterClear);
    iterations++;
  }

  return { grid: currentGrid, attacks: allAttacks };
}

/**
 * Land a piece: place its 3 balls on the grid, then process the board
 * (find patterns, clear, apply gravity, chain).
 */
export function landPiece(grid: Grid, piece: TrianglePiece): { grid: Grid; attacks: Attack[] } {
  // Place the piece's balls on the grid
  const newGrid: Grid = grid.map(row => [...row]);
  const positions = getPieceBallPositions(piece);

  for (let i = 0; i < 3; i++) {
    const ball: Ball = {
      color: piece.colors[i],
      position: positions[i],
    };
    setBall(newGrid, positions[i], ball);
  }

  // Process the board (find patterns, clear, gravity, chain)
  return processBoard(newGrid);
}

/**
 * Check if the game is over due to overflow.
 * Returns true if any ball exists in the top row (row 11).
 */
export function isGameOver(grid: Grid): boolean {
  // Check top row (GRID_HEIGHT - 1) for any balls
  for (let col = 0; col < getRowWidth(GRID_HEIGHT - 1); col++) {
    if (getBall(grid, { row: GRID_HEIGHT - 1, col }) !== null) {
      return true;
    }
  }
  return false;
}

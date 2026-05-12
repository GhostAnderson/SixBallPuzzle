import type { Ball, GridPosition } from './types';
import {
  createEmptyGrid,
  getBall,
  setBall,
  isValidPosition,
  getRowWidth,
  type Grid
} from './grid';
import { GRID_HEIGHT } from './types';

function findFallDestination(grid: Grid, pos: GridPosition): GridPosition {
  let current = pos;

  while (true) {
    if (current.row === 0) {
      return current;
    }

    const isEvenRow = current.row % 2 === 0;

    let lowerLeft: GridPosition;
    let lowerRight: GridPosition;

    if (isEvenRow) {
      lowerLeft = { row: current.row - 1, col: current.col - 1 };
      lowerRight = { row: current.row - 1, col: current.col };
    } else {
      lowerLeft = { row: current.row - 1, col: current.col };
      lowerRight = { row: current.row - 1, col: current.col + 1 };
    }

    const leftEmpty = isValidPosition(lowerLeft) && getBall(grid, lowerLeft) === null;
    const rightEmpty = isValidPosition(lowerRight) && getBall(grid, lowerRight) === null;

    // When both paths are open, prefer the direction that keeps the ball
    // in the same visual column (lowerRight on even rows, lowerLeft on odd rows).
    // This is the "straight down" fall path in the hex grid.
    if (leftEmpty && rightEmpty) {
      // Both paths open: choose the one that maintains column position
      current = isEvenRow ? lowerRight : lowerLeft;
    } else if (rightEmpty) {
      current = lowerRight;
    } else if (leftEmpty) {
      current = lowerLeft;
    } else {
      return current;
    }
  }
}

/**
 * Apply gravity to the grid, making all balls fall to stable positions.
 * Returns a new grid with balls in their final positions.
 */
export function applyGravity(grid: Grid): Grid {
  const newGrid = createEmptyGrid();
  const balls: Ball[] = [];

  for (let row = 0; row < GRID_HEIGHT; row++) {
    const width = getRowWidth(row);
    for (let col = 0; col < width; col++) {
      const ball = getBall(grid, { row, col });
      if (ball !== null) {
        balls.push({ ...ball });
      }
    }
  }

  // Sort balls by row (process bottom balls first for right-side priority)
  balls.sort((a, b) => a.position.row - b.position.row);

  for (const ball of balls) {
    const dest = findFallDestination(newGrid, ball.position);
    const newBall: Ball = { color: ball.color, position: dest };
    setBall(newGrid, dest, newBall);
  }

  return newGrid;
}

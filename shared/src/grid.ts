import { GRID_WIDTH_EVEN, GRID_WIDTH_ODD, GRID_HEIGHT, type GridPosition } from './types';

/**
 * Get the width (number of columns) for a given row.
 * Even rows have 10 columns, odd rows have 9.
 */
export function getRowWidth(row: number): number {
  return row % 2 === 0 ? GRID_WIDTH_EVEN : GRID_WIDTH_ODD;
}

/**
 * Check if a position is within the grid bounds.
 */
export function isValidPosition(pos: GridPosition): boolean {
  if (pos.row < 0 || pos.row >= GRID_HEIGHT) {
    return false;
  }
  if (pos.col < 0 || pos.col >= getRowWidth(pos.row)) {
    return false;
  }
  return true;
}

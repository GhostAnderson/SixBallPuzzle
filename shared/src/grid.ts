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

/** Direction names for the 6 hex neighbors */
export type HexDirection = 'upperLeft' | 'upperRight' | 'left' | 'right' | 'lowerLeft' | 'lowerRight';

function getNeighborOffset(isEvenRow: boolean, direction: HexDirection): { dRow: number; dCol: number } {
  if (isEvenRow) {
    switch (direction) {
      case 'upperLeft':  return { dRow: 1, dCol: -1 };
      case 'upperRight': return { dRow: 1, dCol: 0 };
      case 'left':       return { dRow: 0, dCol: -1 };
      case 'right':      return { dRow: 0, dCol: 1 };
      case 'lowerLeft':  return { dRow: -1, dCol: -1 };
      case 'lowerRight': return { dRow: -1, dCol: 0 };
    }
  } else {
    switch (direction) {
      case 'upperLeft':  return { dRow: 1, dCol: 0 };
      case 'upperRight': return { dRow: 1, dCol: 1 };
      case 'left':       return { dRow: 0, dCol: -1 };
      case 'right':      return { dRow: 0, dCol: 1 };
      case 'lowerLeft':  return { dRow: -1, dCol: 0 };
      case 'lowerRight': return { dRow: -1, dCol: 1 };
    }
  }
}

const ALL_DIRECTIONS: HexDirection[] = ['upperLeft', 'upperRight', 'left', 'right', 'lowerLeft', 'lowerRight'];

/**
 * Get all valid neighbor positions for a given position.
 * Returns only positions that are within the grid bounds.
 */
export function getNeighbors(pos: GridPosition): GridPosition[] {
  const isEvenRow = pos.row % 2 === 0;
  const neighbors: GridPosition[] = [];

  for (const direction of ALL_DIRECTIONS) {
    const offset = getNeighborOffset(isEvenRow, direction);
    const neighbor: GridPosition = {
      row: pos.row + offset.dRow,
      col: pos.col + offset.dCol,
    };
    if (isValidPosition(neighbor)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

import type { GridPosition, PatternMatch } from './types';
import { getBall, getNeighbors, getRowWidth, type Grid } from './grid';
import { GRID_HEIGHT } from './types';

function findConnectedGroup(
  grid: Grid,
  start: GridPosition,
  visited: Set<string>
): GridPosition[] {
  const ball = getBall(grid, start);
  if (!ball) return [];

  const color = ball.color;
  const group: GridPosition[] = [];
  const queue: GridPosition[] = [start];
  const key = (pos: GridPosition) => `${pos.row},${pos.col}`;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = key(current);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    const currentBall = getBall(grid, current);
    if (!currentBall || currentBall.color !== color) continue;

    group.push(current);

    for (const neighbor of getNeighbors(current)) {
      if (!visited.has(key(neighbor))) {
        queue.push(neighbor);
      }
    }
  }

  return group;
}

/**
 * Find all groups of 6+ connected same-colored balls.
 */
export function findSixConnected(grid: Grid): PatternMatch[] {
  const visited = new Set<string>();
  const matches: PatternMatch[] = [];

  for (let row = 0; row < GRID_HEIGHT; row++) {
    const width = getRowWidth(row);
    for (let col = 0; col < width; col++) {
      const pos = { row, col };
      const key = `${row},${col}`;

      if (visited.has(key)) continue;

      const ball = getBall(grid, pos);
      if (!ball) {
        visited.add(key);
        continue;
      }

      const group = findConnectedGroup(grid, pos, visited);

      if (group.length >= 6) {
        matches.push({
          type: 'sixConnected',
          color: ball.color,
          positions: group,
        });
      }
    }
  }

  return matches;
}

type LineDirection = 'horizontal' | 'diagonalUpRight' | 'diagonalUpLeft';

function getNextInLine(pos: GridPosition, direction: LineDirection): GridPosition {
  const isEvenRow = pos.row % 2 === 0;

  switch (direction) {
    case 'horizontal':
      return { row: pos.row, col: pos.col + 1 };
    case 'diagonalUpRight':
      if (isEvenRow) {
        return { row: pos.row + 1, col: pos.col };
      } else {
        return { row: pos.row + 1, col: pos.col + 1 };
      }
    case 'diagonalUpLeft':
      if (isEvenRow) {
        return { row: pos.row + 1, col: pos.col - 1 };
      } else {
        return { row: pos.row + 1, col: pos.col };
      }
  }
}

function findLineInDirection(
  grid: Grid,
  start: GridPosition,
  direction: LineDirection
): GridPosition[] {
  const ball = getBall(grid, start);
  if (!ball) return [];

  const color = ball.color;
  const line: GridPosition[] = [start];
  let current = start;

  while (true) {
    const next = getNextInLine(current, direction);
    const nextBall = getBall(grid, next);

    if (!nextBall || nextBall.color !== color) {
      break;
    }

    line.push(next);
    current = next;
  }

  return line;
}

/**
 * Find all six-in-a-line patterns (3 directions: horizontal, both diagonals).
 */
export function findSixLine(grid: Grid): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const directions: LineDirection[] = ['horizontal', 'diagonalUpRight', 'diagonalUpLeft'];
  const foundLines = new Set<string>();

  for (let row = 0; row < GRID_HEIGHT; row++) {
    const width = getRowWidth(row);
    for (let col = 0; col < width; col++) {
      const pos = { row, col };
      const ball = getBall(grid, pos);
      if (!ball) continue;

      for (const direction of directions) {
        const line = findLineInDirection(grid, pos, direction);

        if (line.length >= 6) {
          const sortedPositions = [...line].sort((a, b) =>
            a.row !== b.row ? a.row - b.row : a.col - b.col
          );
          const lineKey = sortedPositions.map(p => `${p.row},${p.col}`).join('|');

          if (!foundLines.has(lineKey)) {
            foundLines.add(lineKey);
            matches.push({
              type: 'sixLine',
              color: ball.color,
              positions: line,
            });
          }
        }
      }
    }
  }

  return matches;
}

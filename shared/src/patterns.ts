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

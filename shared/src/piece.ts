import type { TrianglePiece, GridPosition, RotationState, BallColor } from './types';
import { isValidPosition, getBall, type Grid } from './grid';
import { BALL_COLORS, GRID_HEIGHT } from './types';

interface RNGLike {
  pickOne<T>(items: readonly T[]): T;
}

interface Offset {
  dRow: number;
  dColEven: number;
  dColOdd: number;
}

// Each rotation is a set of 3 mutually-adjacent hex cells (proper equilateral triangle).
// Directions: UL=(+1,-1/0), UR=(+1,0/+1), R=(0,+1/+1), LR=(-1,0/+1), LL=(-1,-1/0), L=(0,-1/-1)
// (dColEven / dColOdd for even/odd anchor row)
const ROTATION_OFFSETS: Record<RotationState, [Offset, Offset, Offset]> = {
  0: [  // center (apex) + LR + LL  →  ▲ upright
    { dRow: 0,  dColEven: 0,  dColOdd: 0  },
    { dRow: -1, dColEven: 0,  dColOdd: 1  },
    { dRow: -1, dColEven: -1, dColOdd: 0  },
  ],
  1: [  // center + LL + L
    { dRow: 0,  dColEven: 0,  dColOdd: 0  },
    { dRow: -1, dColEven: -1, dColOdd: 0  },
    { dRow: 0,  dColEven: -1, dColOdd: -1 },
  ],
  2: [  // center + L + UL
    { dRow: 0, dColEven: 0,  dColOdd: 0  },
    { dRow: 0, dColEven: -1, dColOdd: -1 },
    { dRow: 1, dColEven: -1, dColOdd: 0  },
  ],
  3: [  // center + UL + UR  →  ▽ inverted
    { dRow: 0, dColEven: 0,  dColOdd: 0 },
    { dRow: 1, dColEven: -1, dColOdd: 0 },
    { dRow: 1, dColEven: 0,  dColOdd: 1 },
  ],
  4: [  // center + UR + R
    { dRow: 0, dColEven: 0,  dColOdd: 0 },
    { dRow: 1, dColEven: 0,  dColOdd: 1 },
    { dRow: 0, dColEven: 1,  dColOdd: 1 },
  ],
  5: [  // center + R + LR
    { dRow: 0,  dColEven: 0, dColOdd: 0 },
    { dRow: 0,  dColEven: 1, dColOdd: 1 },
    { dRow: -1, dColEven: 0, dColOdd: 1 },
  ],
};

/**
 * Get the grid positions of the 3 balls in a triangle piece.
 * Returns positions in order [ball0, ball1, ball2] matching the colors array.
 */
export function getPieceBallPositions(piece: TrianglePiece): [GridPosition, GridPosition, GridPosition] {
  const { position, rotation } = piece;
  const isEvenRow = position.row % 2 === 0;
  const offsets = ROTATION_OFFSETS[rotation];

  return offsets.map((offset) => ({
    row: position.row + offset.dRow,
    col: position.col + (isEvenRow ? offset.dColEven : offset.dColOdd),
  })) as [GridPosition, GridPosition, GridPosition];
}

export type MoveDirection = 'left' | 'right' | 'down';

/**
 * Create a new piece moved in the specified direction.
 * Does not check validity.
 */
export function movePiece(piece: TrianglePiece, direction: MoveDirection): TrianglePiece {
  const { position } = piece;
  let newPosition: GridPosition;

  switch (direction) {
    case 'left':
      newPosition = { row: position.row, col: position.col - 1 };
      break;
    case 'right':
      newPosition = { row: position.row, col: position.col + 1 };
      break;
    case 'down':
      newPosition = { row: position.row - 1, col: position.col };
      break;
  }

  return {
    ...piece,
    position: newPosition,
  };
}

/**
 * Create a new piece rotated 60 degrees clockwise.
 * Does not check validity.
 */
export function rotatePiece(piece: TrianglePiece): TrianglePiece {
  const newRotation = ((piece.rotation + 1) % 6) as RotationState;
  return {
    ...piece,
    rotation: newRotation,
  };
}

/**
 * Check if a piece can be placed on the grid.
 * Returns false if any ball position is out of bounds or occupied.
 */
export function canPlacePiece(grid: Grid, piece: TrianglePiece): boolean {
  const positions = getPieceBallPositions(piece);

  for (const pos of positions) {
    if (!isValidPosition(pos)) {
      return false;
    }
    if (getBall(grid, pos) !== null) {
      return false;
    }
  }

  return true;
}

/**
 * Create a piece at the spawn position (bottom center of grid).
 * Accepts an optional RNG for deterministic piece generation.
 */
export function createPieceAtSpawn(rng?: RNGLike): TrianglePiece {
  const pick = rng
    ? () => rng.pickOne(BALL_COLORS)
    : () => BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
  return { position: { row: GRID_HEIGHT - 2, col: 4 }, rotation: 0, colors: [pick(), pick(), pick()] };
}

/**
 * Create a new random triangle piece at default position.
 * Accepts an optional RNG for deterministic piece generation.
 */
export function createRandomPiece(rng?: RNGLike): TrianglePiece {
  const pick = rng
    ? () => rng.pickOne(BALL_COLORS)
    : () => BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
  return { position: { row: 0, col: 0 }, rotation: 0, colors: [pick(), pick(), pick()] };
}

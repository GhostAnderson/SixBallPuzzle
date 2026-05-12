import type { TrianglePiece, GridPosition, RotationState } from './types';

interface Offset {
  dRow: number;
  dColEven: number;
  dColOdd: number;
}

const ROTATION_OFFSETS: Record<RotationState, [Offset, Offset, Offset]> = {
  0: [
    { dRow: 1, dColEven: 0, dColOdd: 1 },
    { dRow: 0, dColEven: -1, dColOdd: -1 },
    { dRow: 0, dColEven: 0, dColOdd: 0 },
  ],
  1: [
    { dRow: 1, dColEven: 0, dColOdd: 1 },
    { dRow: 0, dColEven: 0, dColOdd: 0 },
    { dRow: 1, dColEven: -1, dColOdd: 0 },
  ],
  2: [
    { dRow: 0, dColEven: 0, dColOdd: 0 },
    { dRow: -1, dColEven: 0, dColOdd: 1 },
    { dRow: 1, dColEven: -1, dColOdd: 0 },
  ],
  3: [
    { dRow: -1, dColEven: -1, dColOdd: 0 },
    { dRow: 0, dColEven: 0, dColOdd: 0 },
    { dRow: 0, dColEven: -1, dColOdd: -1 },
  ],
  4: [
    { dRow: -1, dColEven: -1, dColOdd: 0 },
    { dRow: -1, dColEven: 0, dColOdd: 1 },
    { dRow: 0, dColEven: 0, dColOdd: 0 },
  ],
  5: [
    { dRow: 0, dColEven: 0, dColOdd: 0 },
    { dRow: 1, dColEven: -1, dColOdd: 0 },
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

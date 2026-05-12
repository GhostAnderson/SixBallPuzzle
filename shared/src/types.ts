/** Ball colors in the game */
export type BallColor = 'red' | 'purple' | 'yellow' | 'blue' | 'green';

/** All possible ball colors */
export const BALL_COLORS: readonly BallColor[] = ['red', 'purple', 'yellow', 'blue', 'green'] as const;

/** Position in the hexagonal grid */
export interface GridPosition {
  row: number;  // 0 = bottom, 11 = top
  col: number;  // 0 = left
}

/** A ball on the grid */
export interface Ball {
  color: BallColor;
  position: GridPosition;
}

/** Grid dimensions */
export const GRID_WIDTH_EVEN = 10;  // Columns in even rows (0, 2, 4...)
export const GRID_WIDTH_ODD = 9;    // Columns in odd rows (1, 3, 5...)
export const GRID_HEIGHT = 12;      // Total rows (0-11)

/** Rotation state of the falling triangle (0-5, each step is 60 degrees clockwise) */
export type RotationState = 0 | 1 | 2 | 3 | 4 | 5;

/** A falling triangle piece with 3 balls */
export interface TrianglePiece {
  /** Center position of the piece */
  position: GridPosition;
  /** Current rotation (0-5) */
  rotation: RotationState;
  /** Colors of the 3 balls [top/center, bottomLeft, bottomRight] at rotation 0 */
  colors: [BallColor, BallColor, BallColor];
}

/** Pattern types that can be matched */
export type PatternType = 'hexagonRing' | 'sixLine' | 'pyramid' | 'sixConnected';

/** Result of pattern detection */
export interface PatternMatch {
  type: PatternType;
  positions: GridPosition[];
  color: BallColor;
}

/** Attack types sent to opponent */
export type AttackType = 'hexagonRings' | 'rows' | 'triangles';

/** Attack payload */
export interface Attack {
  type: AttackType;
  count: number;
}

/** Game phase */
export type GamePhase = 'waiting' | 'countdown' | 'playing' | 'paused' | 'ended';

/** Player state */
export interface PlayerState {
  id: string;
  grid: (Ball | null)[][];  // grid[row][col]
  currentPiece: TrianglePiece | null;
  nextPiece: TrianglePiece;
  attackQueue: Attack[];
  isAlive: boolean;
}

/** Complete game state */
export interface GameState {
  phase: GamePhase;
  players: [PlayerState, PlayerState];
  startTime: number | null;
  winner: string | null;
}

import {
  movePiece, rotatePiece, canPlacePiece, landPiece, isGameOver,
  createEmptyGrid, createRNG, createPieceAtSpawn,
  type GameState, type PlayerState, type TrianglePiece,
} from '@six-balls/shared';

export type PlayerInput = 'moveLeft' | 'moveRight' | 'rotate' | 'softDrop' | 'hardDrop';

export class LocalGameEngine {
  state: GameState;

  constructor() {
    const rng = createRNG(Date.now());
    const seq: TrianglePiece[] = Array.from({ length: 100 }, () => createPieceAtSpawn(rng));
    this.state = {
      phase: 'playing', players: [this.makePlayer('player1', seq, 0), this.makePlayer('player2', seq, 0)],
      startTime: Date.now(), winner: null, pieceIndex: 0, pieceSequence: seq,
    };
  }

  private makePlayer(id: string, seq: TrianglePiece[], idx: number): PlayerState {
    return { id, grid: createEmptyGrid(), currentPiece: seq[idx], nextPiece: seq[idx + 1], attackQueue: [], isAlive: true };
  }

  handleInput(pi: 0 | 1, input: PlayerInput) {
    if (this.state.phase !== 'playing') return;
    const p = this.state.players[pi];
    if (!p.isAlive || !p.currentPiece) return;

    let np: TrianglePiece;
    switch (input) {
      case 'moveLeft': np = movePiece(p.currentPiece, 'left'); if (!canPlacePiece(p.grid, np)) return; break;
      case 'moveRight': np = movePiece(p.currentPiece, 'right'); if (!canPlacePiece(p.grid, np)) return; break;
      case 'rotate': np = rotatePiece(p.currentPiece); if (!canPlacePiece(p.grid, np)) return; break;
      case 'softDrop': np = movePiece(p.currentPiece, 'down'); if (!canPlacePiece(p.grid, np)) { this.land(pi, p.currentPiece); return; } break;
      case 'hardDrop': np = p.currentPiece; while (true) { const n = movePiece(np, 'down'); if (canPlacePiece(p.grid, n)) np = n; else break; } this.land(pi, np); return;
      default: return;
    }
    const np2 = [...this.state.players] as [PlayerState, PlayerState];
    np2[pi] = { ...p, currentPiece: np };
    this.state = { ...this.state, players: np2 };
  }

  private land(pi: number, piece: TrianglePiece) {
    const p = this.state.players[pi];
    const oi = pi === 0 ? 1 : 0;
    const { grid: pg, attacks } = landPiece(p.grid, piece);
    const dead = isGameOver(pg);
    const ni = this.state.pieceIndex + 1;
    const np2 = [...this.state.players] as [PlayerState, PlayerState];
    np2[pi] = { ...p, grid: pg, currentPiece: dead ? null : this.state.pieceSequence[ni], nextPiece: this.state.pieceSequence[ni + 1], isAlive: !dead };
    if (attacks.length > 0) np2[oi] = { ...np2[oi], attackQueue: [...np2[oi].attackQueue, ...attacks] };
    let w: string | null = null;
    if (!np2[0].isAlive) w = np2[1].id;
    if (!np2[1].isAlive) w = np2[0].id;
    this.state = { ...this.state, players: np2, phase: w ? 'ended' : 'playing', winner: w, pieceIndex: ni };
  }
}

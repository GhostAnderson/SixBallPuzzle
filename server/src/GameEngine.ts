import {
  movePiece,
  rotatePiece,
  canPlacePiece,
  landPiece,
  createPieceAtSpawn,
  isGameOver,
  createEmptyGrid,
  createRNG,
  type GameState,
  type PlayerState,
  type TrianglePiece,
  type Grid,
} from '@six-balls/shared';

export type GameInput = 'moveLeft' | 'moveRight' | 'rotate' | 'softDrop' | 'hardDrop';

export function createInitialGameState(player1Id: string, player2Id: string): GameState {
  const rng = createRNG(Date.now());
  const sequence: TrianglePiece[] = [];
  for (let i = 0; i < 100; i++) {
    sequence.push(createPieceAtSpawn(rng));
  }
  const p1 = createPlayerState(player1Id, sequence, 0);
  const p2 = createPlayerState(player2Id, sequence, 0);
  return {
    phase: 'playing', players: [p1, p2],
    startTime: Date.now(), winner: null,
    pieceIndex: 0, pieceSequence: sequence,
  };
}

function createPlayerState(id: string, sequence: TrianglePiece[], index: number): PlayerState {
  return {
    id, grid: createEmptyGrid(),
    currentPiece: sequence[index],
    nextPiece: sequence[index + 1],
    attackQueue: [], isAlive: true,
  };
}

export function processInput(
  gameState: GameState,
  playerId: string,
  input: GameInput
): GameState {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return gameState;

  const player = gameState.players[playerIndex];
  if (!player.isAlive || !player.currentPiece) return gameState;

  let newPiece: TrianglePiece;

  switch (input) {
    case 'moveLeft':
      newPiece = movePiece(player.currentPiece, 'left');
      if (!canPlacePiece(player.grid, newPiece)) return gameState;
      break;
    case 'moveRight':
      newPiece = movePiece(player.currentPiece, 'right');
      if (!canPlacePiece(player.grid, newPiece)) return gameState;
      break;
    case 'rotate':
      newPiece = rotatePiece(player.currentPiece);
      if (!canPlacePiece(player.grid, newPiece)) return gameState;
      break;
    case 'softDrop':
      newPiece = movePiece(player.currentPiece, 'down');
      if (!canPlacePiece(player.grid, newPiece)) {
        return handlePieceLand(gameState, playerIndex, player.currentPiece);
      }
      break;
    case 'hardDrop':
      newPiece = player.currentPiece;
      while (true) {
        const next = movePiece(newPiece, 'down');
        if (canPlacePiece(player.grid, next)) {
          newPiece = next;
        } else {
          break;
        }
      }
      return handlePieceLand(gameState, playerIndex, newPiece);
    default:
      return gameState;
  }

  const newPlayers = [...gameState.players] as [PlayerState, PlayerState];
  newPlayers[playerIndex] = { ...player, currentPiece: newPiece };
  return { ...gameState, players: newPlayers };
}

function handlePieceLand(gameState: GameState, playerIndex: number, piece: TrianglePiece): GameState {
  const player = gameState.players[playerIndex];
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const { grid: processedGrid, attacks } = landPiece(player.grid, piece);
  const dead = isGameOver(processedGrid);
  const newPlayers = [...gameState.players] as [PlayerState, PlayerState];
  const nextIndex = gameState.pieceIndex + 1;

  newPlayers[playerIndex] = {
    ...player, grid: processedGrid,
    currentPiece: dead ? null : gameState.pieceSequence[nextIndex],
    nextPiece: gameState.pieceSequence[nextIndex + 1],
    isAlive: !dead,
  };

  if (attacks.length > 0) {
    newPlayers[opponentIndex] = {
      ...newPlayers[opponentIndex],
      attackQueue: [...newPlayers[opponentIndex].attackQueue, ...attacks],
    };
  }

  let winner: string | null = null;
  if (!newPlayers[0].isAlive) winner = newPlayers[1].id;
  if (!newPlayers[1].isAlive) winner = newPlayers[0].id;

  return { ...gameState, players: newPlayers, phase: winner ? 'ended' : 'playing', winner, pieceIndex: nextIndex };
}

import type { GameState } from '@six-balls/shared';
import Board from './Board';

interface GameViewProps {
  gameState: GameState;
  myPlayerId: string;
  theme?: string;
}

export default function GameView({ gameState, myPlayerId, theme }: GameViewProps) {
  const myIndex = gameState.players.findIndex(p => p.id === myPlayerId);
  const myPlayer = gameState.players[myIndex];
  const opponent = gameState.players[myIndex === 0 ? 1 : 0];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
      {/* My board */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>You</h3>
        {myPlayer && (
          <Board grid={myPlayer.grid} currentPiece={myPlayer.currentPiece} nextPiece={myPlayer.nextPiece} theme={theme} />
        )}
        {gameState.winner === myPlayerId && (
          <div style={{ marginTop: '1rem', color: '#44ff44', fontSize: '1.2rem' }}>You Win!</div>
        )}
        {gameState.winner && gameState.winner !== myPlayerId && (
          <div style={{ marginTop: '1rem', color: '#ff4444', fontSize: '1.2rem' }}>You Lose</div>
        )}
      </div>

      {/* Opponent board */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Opponent</h3>
        {opponent && (
          <Board grid={opponent.grid} currentPiece={opponent.currentPiece} nextPiece={opponent.nextPiece} theme={theme} />
        )}
        {!opponent?.isAlive && (
          <div style={{ marginTop: '0.5rem', color: '#44ff44' }}>Defeated!</div>
        )}
      </div>
    </div>
  );
}

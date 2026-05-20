import type { GameState, PlayerState, Attack } from '@six-balls/shared';
import { getPieceBallPositions } from '@six-balls/shared';
import Board from './Board';

const BALL_HEX: Record<string, string> = {
  red: '#ff3366', purple: '#8833ff', yellow: '#ffbb00', blue: '#3366ff', green: '#22bb55',
};

function MiniDot({ color, size = 7 }: { color: string; size?: number }) {
  const base = BALL_HEX[color] ?? '#cccccc';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: base, border: '1.5px solid white',
      boxShadow: `0 1px 3px ${base}88`,
      flexShrink: 0,
    }} />
  );
}

function NextPiecePreview({ nextPiece }: { nextPiece: PlayerState['nextPiece'] }) {
  const positions = getPieceBallPositions(nextPiece);
  const minRow = Math.min(...positions.map(p => p.row));
  const minCol = Math.min(...positions.map(p => p.col));
  const cells = positions.map((p, i) => ({
    row: p.row - minRow, col: p.col - minCol, color: nextPiece.colors[i],
  }));
  const maxRow = Math.max(...cells.map(c => c.row));
  const maxCol = Math.max(...cells.map(c => c.col));
  const CELL = 16;
  return (
    <div style={{ position: 'relative', width: (maxCol + 1) * CELL + 8, height: (maxRow + 1) * CELL + 8, margin: '0 auto' }}>
      {cells.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: c.col * CELL, top: (maxRow - c.row) * CELL }}>
          <MiniDot color={c.color} size={12} />
        </div>
      ))}
    </div>
  );
}

function AttackDiagram({ attack }: { attack: Attack | null }) {
  if (!attack) {
    return (
      <div style={{ textAlign: 'center', color: '#ddd', fontSize: '11px', padding: '8px 0' }}>
        · · · <br />safe!
      </div>
    );
  }

  const COUNT_LABEL = `${attack.count}× incoming`;

  if (attack.type === 'hexagonRings') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            <MiniDot color="red" /><MiniDot color="red" />
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <MiniDot color="red" />
            <div style={{ width: 7, height: 7, borderRadius: '50%', border: '1px dashed #ff336688', flexShrink: 0 }} />
            <MiniDot color="red" />
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <MiniDot color="red" /><MiniDot color="red" />
          </div>
        </div>
        <div style={{ fontSize: '8px', color: '#cc88aa' }}>{COUNT_LABEL}</div>
      </div>
    );
  }

  if (attack.type === 'rows') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: 4 }}>
          <div style={{ display: 'flex', gap: '1px', justifyContent: 'center' }}>
            {(['purple', 'blue', 'purple', 'yellow', 'purple'] as const).map((c, i) => <MiniDot key={i} color={c} />)}
          </div>
          <div style={{ display: 'flex', gap: '1px', justifyContent: 'center' }}>
            {(['green', 'red', 'blue', 'green', 'yellow'] as const).map((c, i) => <MiniDot key={i} color={c} />)}
          </div>
        </div>
        <div style={{ fontSize: '8px', color: '#cc88aa' }}>{COUNT_LABEL}</div>
      </div>
    );
  }

  if (attack.type === 'triangles') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', gap: '2px' }}><MiniDot color="yellow" /></div>
          <div style={{ display: 'flex', gap: '2px' }}><MiniDot color="yellow" /><MiniDot color="yellow" /></div>
          <div style={{ display: 'flex', gap: '2px' }}><MiniDot color="yellow" /><MiniDot color="yellow" /><MiniDot color="yellow" /></div>
        </div>
        <div style={{ fontSize: '8px', color: '#cc88aa' }}>{COUNT_LABEL}</div>
      </div>
    );
  }

  return null;
}

function HudColumn({ player, label }: { player: PlayerState; label: string }) {
  const nextAttack = player.attackQueue[0] ?? null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '88px', flexShrink: 0 }}>
      <div style={{ fontWeight: 700, fontSize: '11px', color: '#ff4499', letterSpacing: '1px', textAlign: 'center' }}>
        {label}
      </div>

      <div style={{ background: 'white', borderRadius: '10px', border: '2px solid #ffb3d1', padding: '8px 6px', boxShadow: '0 2px 8px rgba(255,100,150,0.12)' }}>
        <div style={{ fontSize: '9px', color: '#cc88aa', fontWeight: 700, letterSpacing: '1px', textAlign: 'center', marginBottom: 6 }}>NEXT</div>
        <NextPiecePreview nextPiece={player.nextPiece} />
      </div>

      <div style={{ background: 'white', borderRadius: '10px', border: nextAttack ? '2px solid #cc99ff' : '2px dashed #eee', padding: '8px 6px', boxShadow: nextAttack ? '0 2px 8px rgba(136,51,255,0.12)' : 'none' }}>
        <div style={{ fontSize: '9px', color: '#cc88aa', fontWeight: 700, letterSpacing: '1px', textAlign: 'center', marginBottom: 6 }}>INCOMING</div>
        <AttackDiagram attack={nextAttack} />
      </div>
    </div>
  );
}

interface GameViewProps {
  gameState: GameState;
  myPlayerId: string;
}

export default function GameView({ gameState, myPlayerId }: GameViewProps) {
  const myIndex = gameState.players.findIndex(p => p.id === myPlayerId);
  const myPlayer = gameState.players[myIndex !== -1 ? myIndex : 0];
  const opponent = gameState.players[myIndex === 0 ? 1 : 0];
  const startTime = gameState.startTime;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '12px', padding: '16px 24px', flexWrap: 'wrap' }}>

      <HudColumn player={myPlayer} label="YOU" />

      <Board
        grid={myPlayer.grid}
        currentPiece={myPlayer.currentPiece}
        startTime={startTime}
        isMyBoard={true}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', padding: '0 4px' }}>
        <div style={{ fontWeight: 900, fontSize: '20px', color: '#cc88aa', letterSpacing: '2px' }}>VS</div>
      </div>

      <Board
        grid={opponent.grid}
        currentPiece={opponent.currentPiece}
        startTime={startTime}
        isMyBoard={false}
      />

      <HudColumn player={opponent} label="OPP" />

    </div>
  );
}

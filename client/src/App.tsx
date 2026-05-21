import { useState, useEffect, useCallback } from 'react';
import { getSocket } from './socket/socket';
import Menu from './components/Menu';
import GameView from './components/GameView';
import { useLocalGame } from './hooks/useLocalGame';
import { useAutoDrop } from './hooks/useAutoDrop';
import type { GameState } from '@six-balls/shared';

type AppScreen = 'menu' | 'waiting' | 'playing' | 'localPlay';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const { gameState: localGameState, startGame: startLocalGame, handleInput: handleLocalInput, stopGame: stopLocalGame } = useLocalGame();

  useEffect(() => {
    const socket = getSocket();
    socket.on('roomCreated', ({ code }: { code: string }) => setRoomCode(code));
    socket.on('joinError', ({ message }: { message: string }) => setJoinError(message));
    socket.on('roomJoined', ({ code }: { code: string }) => { setRoomCode(code); setJoinError(null); });
    socket.on('playerJoined', ({ playerCount }: { playerCount: number }) => {
      if (playerCount === 2) setScreen('waiting');
    });
    socket.on('gameStart', ({ gameState: s, playerId: id }: { gameState: GameState; playerId: string }) => {
      setScreen('playing'); setGameState(s); setPlayerId(id);
    });
    socket.on('gameStateUpdate', ({ gameState: s }: { gameState: GameState }) => setGameState(s));
    return () => {
      socket.off('roomCreated'); socket.off('joinError'); socket.off('roomJoined');
      socket.off('playerJoined'); socket.off('gameStart'); socket.off('gameStateUpdate');
    };
  }, []);

  // Online keyboard controls
  useEffect(() => {
    if (screen !== 'playing') return;
    const hkd = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); getSocket().emit('playerInput', { action: 'moveLeft' }); break;
        case 'ArrowRight': e.preventDefault(); getSocket().emit('playerInput', { action: 'moveRight' }); break;
        case 'ArrowUp': e.preventDefault(); getSocket().emit('playerInput', { action: 'rotate' }); break;
        case 'ArrowDown': e.preventDefault(); getSocket().emit('playerInput', { action: 'softDrop' }); break;
        case ' ': e.preventDefault(); getSocket().emit('playerInput', { action: 'hardDrop' }); break;
      }
    };
    window.addEventListener('keydown', hkd);
    return () => window.removeEventListener('keydown', hkd);
  }, [screen]);

  // Online auto-drop (softDrop, not hardDrop)
  const handleAutoDrop = useCallback(() => {
    if (!gameState || !playerId) return;
    getSocket().emit('playerInput', { action: 'softDrop' });
  }, [gameState, playerId]);

  useAutoDrop({
    startTime: gameState?.startTime ?? null,
    onDrop: handleAutoDrop,
    isActive: screen === 'playing' && gameState?.phase === 'playing',
  });

  const handleCreateRoom = useCallback(() => { getSocket().emit('createRoom'); setJoinError(null); }, []);
  const handleJoinRoom = useCallback((code: string) => { getSocket().emit('joinRoom', { code }); setJoinError(null); }, []);
  const handleReady = useCallback(() => { getSocket().emit('playerReady'); }, []);

  const handleLocalPlay = useCallback(() => {
    setScreen('localPlay');
    startLocalGame();
  }, [startLocalGame]);

  // Local keyboard controls
  useEffect(() => {
    if (screen !== 'localPlay') return;
    const hkd = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); handleLocalInput(0, 'moveLeft'); break;
        case 'ArrowRight': e.preventDefault(); handleLocalInput(0, 'moveRight'); break;
        case 'ArrowUp': e.preventDefault(); handleLocalInput(0, 'rotate'); break;
        case 'ArrowDown': e.preventDefault(); handleLocalInput(0, 'softDrop'); break;
        case ' ': e.preventDefault(); handleLocalInput(0, 'hardDrop'); break;
      }
      switch (e.code) {
        case 'KeyA': e.preventDefault(); handleLocalInput(1, 'moveLeft'); break;
        case 'KeyD': e.preventDefault(); handleLocalInput(1, 'moveRight'); break;
        case 'KeyW': e.preventDefault(); handleLocalInput(1, 'rotate'); break;
        case 'KeyS': e.preventDefault(); handleLocalInput(1, 'softDrop'); break;
        case 'ShiftLeft': case 'ShiftRight': e.preventDefault(); handleLocalInput(1, 'hardDrop'); break;
      }
    };
    window.addEventListener('keydown', hkd);
    return () => { window.removeEventListener('keydown', hkd); stopLocalGame(); };
  }, [screen, handleLocalInput, stopLocalGame]);

  const backToMenu = useCallback(() => { setScreen('menu'); setGameState(null); setRoomCode(null); stopLocalGame(); }, [stopLocalGame]);
  const rematch = useCallback(() => { startLocalGame(); }, [startLocalGame]);

  // ── Online game screen ──
  if (screen === 'playing' || screen === 'waiting') {
    const isEnded = gameState?.phase === 'ended';
    const didWin = isEnded && gameState?.winner === playerId;
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff5fb, #f5f0ff)', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ position: 'relative', textAlign: 'center', padding: '16px 0 12px', borderBottom: '1px solid #f0d0e8' }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#ff4499', letterSpacing: '2px' }}>SIX BALLS PUZZLE</h1>
          <button onClick={backToMenu} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', padding: '7px 16px', fontSize: '13px', fontWeight: 700, background: '#f0e0f0', border: 'none', borderRadius: '16px', color: '#8833ff', cursor: 'pointer' }}>
            Menu
          </button>
        </div>
        {screen === 'waiting' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '48px' }}>
            <p style={{ color: '#cc88aa', fontSize: '18px' }}>Opponent joined! Get ready...</p>
            <button onClick={handleReady} style={{ padding: '12px 32px', fontSize: '16px', fontWeight: 700, background: 'linear-gradient(135deg, #ff4499, #cc33ff)', border: 'none', borderRadius: '24px', color: 'white', cursor: 'pointer', boxShadow: '0 3px 12px rgba(255,50,150,0.4)' }}>
              READY
            </button>
          </div>
        ) : gameState ? (
          <div style={{ position: 'relative' }}>
            <GameView gameState={gameState} myPlayerId={playerId} />
            {isEnded && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '40px 56px', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>{didWin ? '🎉' : '😢'}</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: didWin ? '#ff4499' : '#8833ff', marginBottom: '24px' }}>{didWin ? 'YOU WIN' : 'YOU LOSE'}</div>
                  <button onClick={backToMenu} style={{ padding: '12px 28px', fontSize: '15px', fontWeight: 700, background: 'linear-gradient(135deg, #ff4499, #cc33ff)', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>
                    Back to Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : <p style={{ textAlign: 'center', padding: '48px', color: '#cc88aa' }}>Loading...</p>}
        <div style={{ textAlign: 'center', padding: '12px 0 16px', borderTop: '1px solid #f0d0e8', color: '#cc88aa', fontSize: '13px' }}>
          ← → move &nbsp;·&nbsp; ↑ rotate &nbsp;·&nbsp; ↓ soft drop &nbsp;·&nbsp; Space drop
        </div>
      </div>
    );
  }

  // ── Local play screen ──
  if (screen === 'localPlay') {
    const ls = localGameState;
    const isEnded = ls?.phase === 'ended';
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff5fb, #f5f0ff)', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ position: 'relative', textAlign: 'center', padding: '16px 0 12px', borderBottom: '1px solid #f0d0e8' }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#ff4499', letterSpacing: '2px' }}>SIX BALLS PUZZLE</h1>
          <button onClick={backToMenu} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', padding: '7px 16px', fontSize: '13px', fontWeight: 700, background: '#f0e0f0', border: 'none', borderRadius: '16px', color: '#8833ff', cursor: 'pointer' }}>
            Menu
          </button>
        </div>
        {ls ? (
          <div style={{ position: 'relative' }}>
            <GameView gameState={ls} myPlayerId="player1" />
            {isEnded && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '40px 56px', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>{ls.winner === 'player1' ? '🎉' : '😢'}</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#ff4499', marginBottom: '24px' }}>{ls.winner === 'player1' ? 'P1 WINS' : 'P2 WINS'}</div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={rematch} style={{ padding: '12px 28px', fontSize: '15px', fontWeight: 700, background: 'linear-gradient(135deg, #ff4499, #cc33ff)', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>
                      Play Again
                    </button>
                    <button onClick={backToMenu} style={{ padding: '12px 28px', fontSize: '15px', fontWeight: 700, background: '#f0e0f0', border: 'none', borderRadius: '20px', color: '#8833ff', cursor: 'pointer' }}>
                      Menu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : <p style={{ textAlign: 'center', padding: '48px', color: '#cc88aa' }}>Starting...</p>}
        <div style={{ textAlign: 'center', padding: '12px 0 16px', borderTop: '1px solid #f0d0e8', color: '#cc88aa', fontSize: '13px' }}>
          P1: ← → ↑ ↓ Space &nbsp;·&nbsp; P2: A D W S Shift
        </div>
      </div>
    );
  }

  // ── Menu screen ──
  return (
    <Menu
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      createdRoomCode={roomCode}
      joinError={joinError}
      onLocalPlay={handleLocalPlay}
    />
  );
}

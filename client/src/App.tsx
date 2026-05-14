import { useState, useEffect, useCallback } from 'react';
import { getSocket } from './socket/socket';
import Menu from './components/Menu';
import GameView from './components/GameView';
import ThemeSwitcher from './components/ThemeSwitcher';
import { getStoredTheme, storeTheme } from './themes/themes';
import { useAutoDrop } from './hooks/useAutoDrop';
import { useLocalGame } from './hooks/useLocalGame';
import type { PlayerInput } from './game/localGame';
import type { GameState } from '@six-balls/shared';

type AppScreen = 'menu' | 'waiting' | 'playing' | 'ended' | 'localPlay';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [theme, setTheme] = useState<string>(getStoredTheme);
  const { gameState: localGameState, startGame: startLocalGame, handleInput: handleLocalInput, stopGame: stopLocalGame } = useLocalGame();

  useEffect(() => {
    const socket = getSocket();

    socket.on('roomCreated', ({ code }: { code: string }) => {
      setRoomCode(code);
    });

    socket.on('joinError', ({ message }: { message: string }) => {
      setJoinError(message);
    });

    socket.on('roomJoined', ({ code }: { code: string }) => {
      setRoomCode(code);
      setJoinError(null);
    });

    socket.on('playerJoined', ({ playerCount }: { playerCount: number }) => {
      if (playerCount === 2) {
        setScreen('waiting');
      }
    });

    socket.on('gameStart', ({ gameState: initialState, playerId: assignedId }: { gameState: GameState; playerId: string }) => {
      setScreen('playing');
      setGameState(initialState);
      setPlayerId(assignedId);
    });

    socket.on('gameStateUpdate', ({ gameState: newState }: { gameState: GameState }) => {
      setGameState(newState);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('joinError');
      socket.off('roomJoined');
      socket.off('playerJoined');
      socket.off('gameStart');
      socket.off('gameStateUpdate');
    };
  }, []);

  const handleCreateRoom = useCallback(() => {
    const socket = getSocket();
    socket.emit('createRoom');
    setJoinError(null);
  }, []);

  const handleJoinRoom = useCallback((code: string) => {
    const socket = getSocket();
    socket.emit('joinRoom', { code });
    setJoinError(null);
  }, []);

  const handleReady = useCallback(() => {
    const socket = getSocket();
    socket.emit('playerReady');
  }, []);

  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme);
    storeTheme(newTheme);
  }, []);

  const handleAutoDrop = useCallback(() => {
    if (!gameState || !playerId) return;
    getSocket().emit('playerInput', { action: 'hardDrop' });
  }, [gameState, playerId]);

  useAutoDrop({
    startTime: gameState?.startTime ?? null,
    onDrop: handleAutoDrop,
    isActive: screen === 'playing' && gameState?.phase === 'playing',
  });

  const handleLocalPlay = useCallback(() => {
    setScreen('localPlay');
    startLocalGame();
  }, [startLocalGame]);

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

  if (screen === 'playing' || screen === 'waiting') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>Six Balls Puzzle</h1>
        {screen === 'waiting' ? (
          <div>
            <p style={{ marginBottom: '1rem' }}>Opponent joined! Get ready...</p>
            <button
              onClick={handleReady}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1.1rem',
                background: '#44aa44',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Ready
            </button>
          </div>
        ) : gameState ? (
          <>
            <ThemeSwitcher currentTheme={theme} onThemeChange={handleThemeChange} />
            <GameView gameState={gameState} myPlayerId={playerId} theme={theme} />
            <p style={{ marginTop: '1rem', color: '#888' }}>
              Arrow keys to move/rotate, Space to drop
            </p>
          </>
        ) : (
          <p>Loading game...</p>
        )}
      </div>
    );
  }

  if (screen === 'localPlay') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Six Balls Puzzle - Local Play</h1>
        <ThemeSwitcher currentTheme={theme} onThemeChange={handleThemeChange} />
        {localGameState ? (
          <>
            <GameView gameState={localGameState} myPlayerId="player1" theme={theme} />
            <p style={{ marginTop: '1rem', color: '#888' }}>P1: Arrow keys + Space | P2: WASD + Shift</p>
            <button onClick={() => { setScreen('menu'); stopLocalGame(); }} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#666', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Back to Menu</button>
          </>
        ) : <p>Starting game...</p>}
      </div>
    );
  }

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

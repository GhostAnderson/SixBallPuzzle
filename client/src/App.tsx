import { useState, useEffect, useCallback } from 'react';
import { getSocket } from './socket/socket';
import Menu from './components/Menu';

type AppScreen = 'menu' | 'waiting' | 'playing' | 'ended';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

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

    socket.on('gameStart', () => {
      setScreen('playing');
    });

    return () => {
      socket.off('roomCreated');
      socket.off('joinError');
      socket.off('roomJoined');
      socket.off('playerJoined');
      socket.off('gameStart');
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

  if (screen === 'playing' || screen === 'waiting') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Six Balls Puzzle</h1>
        {screen === 'waiting' ? (
          <p>Opponent joined! Get ready...</p>
        ) : (
          <p>Playing...</p>
        )}
      </div>
    );
  }

  return (
    <Menu
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      createdRoomCode={roomCode}
      joinError={joinError}
    />
  );
}

import { useState } from 'react';

interface MenuProps {
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  createdRoomCode: string | null;
  joinError: string | null;
}

export default function Menu({ onCreateRoom, onJoinRoom, createdRoomCode, joinError }: MenuProps) {
  const [joinCode, setJoinCode] = useState('');

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Six Balls Puzzle</h1>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <button
          onClick={onCreateRoom}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            background: '#4444ff',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            display: 'block',
            width: '100%',
            marginBottom: '1rem',
          }}
        >
          Create Room
        </button>

        {createdRoomCode && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#2a2a4a',
            borderRadius: '8px',
          }}>
            <p style={{ marginBottom: '0.5rem' }}>Room Code:</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '4px' }}>
              {createdRoomCode}
            </p>
            <p style={{ marginTop: '0.5rem', color: '#888', fontSize: '0.9rem' }}>
              Waiting for opponent to join...
            </p>
          </div>
        )}

        <div style={{
          padding: '1rem',
          background: '#222',
          borderRadius: '8px',
        }}>
          <p style={{ marginBottom: '0.5rem' }}>Join Room</p>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit code"
            maxLength={6}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.5rem',
              marginBottom: '0.5rem',
              fontSize: '1.2rem',
              textAlign: 'center',
              background: '#333',
              border: '1px solid #555',
              borderRadius: '4px',
              color: '#fff',
            }}
          />
          <button
            onClick={() => onJoinRoom(joinCode)}
            disabled={joinCode.length !== 6}
            style={{
              padding: '0.5rem 1rem',
              background: joinCode.length === 6 ? '#44aa44' : '#444',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: joinCode.length === 6 ? 'pointer' : 'default',
              width: '100%',
            }}
          >
            Join
          </button>
          {joinError && (
            <p style={{ marginTop: '0.5rem', color: '#ff4444' }}>{joinError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

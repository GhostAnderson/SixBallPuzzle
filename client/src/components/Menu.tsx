import { useState } from 'react';

interface MenuProps {
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  createdRoomCode: string | null;
  joinError: string | null;
  onLocalPlay?: () => void;
}

const BTN: React.CSSProperties = {
  padding: '14px 24px',
  fontSize: '15px',
  fontWeight: 700,
  border: 'none',
  borderRadius: '24px',
  cursor: 'pointer',
  width: '100%',
  letterSpacing: '1px',
  transition: 'transform 0.1s, box-shadow 0.1s',
};

export default function Menu({ onCreateRoom, onJoinRoom, createdRoomCode, joinError, onLocalPlay }: MenuProps) {
  const [joinCode, setJoinCode] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff5fb, #f5f0ff)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>

      <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#ff4499', letterSpacing: '3px', margin: '0 0 8px', textShadow: '0 2px 0 #ffaacc' }}>
        SIX BALLS PUZZLE
      </h1>
      <p style={{ color: '#cc88aa', fontSize: '14px', marginBottom: '36px' }}>Match 6 to win!</p>

      <div style={{ background: 'white', borderRadius: '20px', padding: '32px 36px', boxShadow: '0 4px 32px rgba(255,68,153,0.15)', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {onLocalPlay && (
          <button
            onClick={onLocalPlay}
            style={{ ...BTN, background: 'linear-gradient(135deg, #ff4499, #cc33ff)', color: 'white', boxShadow: '0 3px 12px rgba(255,50,150,0.4)' }}
          >
            Local Play
          </button>
        )}

        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #ffd0e8, transparent)' }} />

        <button
          onClick={onCreateRoom}
          style={{ ...BTN, background: 'white', color: '#ff4499', border: '2px solid #ffb3d1', boxShadow: '0 2px 8px rgba(255,100,150,0.15)' }}
        >
          Create Online Room
        </button>

        {createdRoomCode && (
          <div style={{ background: 'linear-gradient(135deg, #fff5fb, #f5f0ff)', borderRadius: '12px', padding: '14px', textAlign: 'center', border: '1px solid #ffb3d1' }}>
            <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#cc88aa', fontWeight: 700, letterSpacing: '1px' }}>ROOM CODE</p>
            <p style={{ margin: '0 0 6px', fontSize: '32px', fontWeight: 900, letterSpacing: '6px', color: '#ff4499' }}>{createdRoomCode}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#cc88aa' }}>Waiting for opponent...</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            maxLength={6}
            style={{ padding: '12px 16px', fontSize: '18px', textAlign: 'center', letterSpacing: '4px', fontWeight: 700, border: '2px solid #ffb3d1', borderRadius: '12px', color: '#ff4499', background: 'white', outline: 'none', width: '100%', boxSizing: 'border-box' }}
          />
          <button
            onClick={() => onJoinRoom(joinCode)}
            disabled={joinCode.length !== 6}
            style={{ ...BTN, background: joinCode.length === 6 ? 'linear-gradient(135deg, #8833ff, #cc33ff)' : '#f0e0f0', color: joinCode.length === 6 ? 'white' : '#cc99cc', cursor: joinCode.length === 6 ? 'pointer' : 'default', boxShadow: joinCode.length === 6 ? '0 3px 12px rgba(136,51,255,0.4)' : 'none' }}
          >
            Join Room
          </button>
          {joinError && <p style={{ margin: 0, color: '#ff4499', fontSize: '13px', textAlign: 'center' }}>{joinError}</p>}
        </div>

      </div>
    </div>
  );
}

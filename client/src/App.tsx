import { useState } from 'react';

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'playing'>('menu');

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Six Balls Puzzle</h1>
      {screen === 'menu' ? (
        <div>
          <button onClick={() => setScreen('playing')}>Play</button>
        </div>
      ) : (
        <div>
          <p>Game will go here</p>
          <button onClick={() => setScreen('menu')}>Back</button>
        </div>
      )}
    </div>
  );
}

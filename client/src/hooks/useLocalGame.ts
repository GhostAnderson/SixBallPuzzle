import { useState, useCallback, useRef, useEffect } from 'react';
import { LocalGameEngine, type PlayerInput } from '../game/localGame';
import { getSpeedInterval, type GameState } from '@six-balls/shared';

export function useLocalGame() {
  const engRef = useRef<LocalGameEngine | null>(null);
  const [gs, setGS] = useState<GameState | null>(null);

  const start = useCallback(() => {
    const e = new LocalGameEngine();
    engRef.current = e;
    setGS({ ...e.state });
  }, []);

  const input = useCallback((pi: 0 | 1, act: PlayerInput) => {
    const e = engRef.current;
    if (!e) return;
    e.handleInput(pi, act);
    setGS({ ...e.state });
  }, []);

  const stop = useCallback(() => { engRef.current = null; setGS(null); }, []);

  useEffect(() => {
    if (!gs || gs.phase !== 'playing') return;
    const startTime = gs.startTime!;
    const timers: ReturnType<typeof setTimeout>[] = [];
    function sched(pi: 0 | 1) {
      const iv = getSpeedInterval(Date.now() - startTime);
      timers.push(setTimeout(() => {
        const e = engRef.current;
        if (!e || e.state.phase !== 'playing') return;
        e.handleInput(pi, 'softDrop');
        setGS({ ...e.state });
        if (e.state.phase === 'playing') sched(pi);
      }, iv));
    }
    sched(0); sched(1);
    return () => timers.forEach(t => clearTimeout(t));
  }, [gs?.phase === 'playing', gs?.startTime]);

  return { gameState: gs, startGame: start, handleInput: input, stopGame: stop };
}

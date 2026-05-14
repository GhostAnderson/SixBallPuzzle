import { useEffect, useRef } from 'react';
import { getSpeedInterval } from '@six-balls/shared';

interface AutoDropConfig {
  startTime: number | null;
  onDrop: () => void;
  isActive: boolean;
}

export function useAutoDrop({ startTime, onDrop, isActive }: AutoDropConfig) {
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  useEffect(() => {
    if (!isActive || startTime === null) return;
    const effectiveStartTime = startTime;
    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleNext() {
      const elapsed = Date.now() - effectiveStartTime;
      const interval = getSpeedInterval(elapsed);
      timeoutId = setTimeout(() => { onDropRef.current(); scheduleNext(); }, interval);
    }

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [isActive, startTime]);
}

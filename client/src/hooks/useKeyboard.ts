import { useEffect } from 'react';

export interface KeyboardCallbacks {
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onRotate?: () => void;
  onSoftDrop?: () => void;
  onHardDrop?: () => void;
}

export function useKeyboard(callbacks: KeyboardCallbacks) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          callbacks.onMoveLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          callbacks.onMoveRight?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          callbacks.onRotate?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          callbacks.onSoftDrop?.();
          break;
        case ' ':
          e.preventDefault();
          callbacks.onHardDrop?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
}

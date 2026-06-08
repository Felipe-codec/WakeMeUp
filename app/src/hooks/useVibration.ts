import { useRef, useCallback, useEffect } from 'react';

export function useVibration() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((pattern: number[] = [500, 200, 500, 200, 500]) => {
    if (!('vibrate' in navigator)) return;
    navigator.vibrate(pattern);
    intervalRef.current = setInterval(() => {
      navigator.vibrate(pattern);
    }, 2000);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop };
}

import { useRef, useCallback } from 'react';
import { createAlarmSound } from '../utils/sounds';

export function useSound() {
  const soundRef = useRef(createAlarmSound());

  const play = useCallback(() => {
    soundRef.current.play();
  }, []);

  const stop = useCallback(() => {
    soundRef.current.stop();
  }, []);

  return { play, stop, isPlaying: soundRef.current.isPlaying };
}

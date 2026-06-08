export function createAlarmSound(): { play: () => void; stop: () => void; isPlaying: boolean } {
  const AudioContextCtor: typeof AudioContext | undefined = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return { play: () => {}, stop: () => {}, isPlaying: false };
  }

  let ctx: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;
  let gainNode: GainNode | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let playing = false;

  const play = () => {
    if (playing) return;
    try {
      ctx = new AudioContextCtor();
      playing = true;

      const beep = () => {
        if (!ctx) return;
        try {
          oscillator = ctx.createOscillator();
          gainNode = ctx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.frequency.value = 880;
          oscillator.type = 'square';
          gainNode.gain.value = 0.5;

          oscillator.start();

          setTimeout(() => {
            try {
              oscillator?.stop();
              oscillator?.disconnect();
            } catch {
              // ignore
            }
          }, 200);
        } catch {
          // ignore audio errors
        }
      };

      beep();
      intervalId = setInterval(beep, 400);
    } catch {
      playing = false;
    }
  };

  const stop = () => {
    playing = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    try {
      oscillator?.stop();
      oscillator?.disconnect();
    } catch {
      // ignore
    }
    try {
      ctx?.close();
    } catch {
      // ignore
    }
    ctx = null;
    oscillator = null;
    gainNode = null;
  };

  return {
    play,
    stop,
    get isPlaying() {
      return playing;
    },
  };
}

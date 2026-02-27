export function playAlarmSound(): void {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();

  const beep = (startTime: number, frequency: number, duration: number) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  const now = ctx.currentTime;
  beep(now, 1100, 0.5);
}

export function parseTimerInput(raw: string): number {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  if (!digits) return 0;

  const seconds = parseInt(digits.slice(-2), 10);
  const minutes = digits.length > 2 ? parseInt(digits.slice(0, -2), 10) : 0;

  const clampedSeconds = Math.min(seconds, 59);
  return minutes * 60 + clampedSeconds;
}
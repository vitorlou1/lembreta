import { useState } from "react";

const MAX_SECONDS = 5999;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function useTimerInput() {
  const [totalSeconds, setTotalSeconds] = useState(60);

  const adjust = (delta: number) => {
    setTotalSeconds((prev) => clamp(prev + delta, 0, MAX_SECONDS));
  };

  const reset = () => {
    setTotalSeconds(0);
  };

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    totalSeconds,
    minutes,
    seconds,
    adjust,
    reset,
  };
}
import { useState } from "react";

interface TimerInputState {
  hrs: number;
  min: number;
  sec: number;
}

function clamp(value: number, max: number): number {
  return Math.min(Math.max(0, value), max);
}

export function useTimerInput() {
  const [state, setState] = useState<TimerInputState>({
    hrs: 0,
    min: 0,
    sec: 0,
  });

  const setField = (field: keyof TimerInputState, value: number) => {
    const max = field === "hrs" ? 99 : 59;
    setState((prev) => ({ ...prev, [field]: clamp(value, max) }));
  };

  const reset = () => setState({ hrs: 0, min: 0, sec: 0 });

  const totalSeconds = state.hrs * 3600 + state.min * 60 + state.sec;

  return {
    hrs: state.hrs,
    min: state.min,
    sec: state.sec,
    totalSeconds,
    setField,
    reset,
    adjust: (delta: number) => {
      const next = Math.max(0, totalSeconds + delta);
      setState({
        hrs: Math.floor(next / 3600),
        min: Math.floor((next % 3600) / 60),
        sec: next % 60,
      });
    },
  };
}
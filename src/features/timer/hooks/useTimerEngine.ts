import { useState, useEffect, useRef } from "react";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

interface TimerEngineState {
  remaining: number;
  status: TimerStatus;
}

export function useTimerEngine() {
  const [state, setState] = useState<TimerEngineState>({
    remaining: 0,
    status: "idle",
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTick = () => {
    clearTick();
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.remaining <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return { remaining: 0, status: "finished" };
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
  };

  const start = (totalSeconds: number) => {
    if (totalSeconds <= 0) return;
    setState({ remaining: totalSeconds, status: "running" });
  };

  const pause = () => {
    clearTick();
    setState((prev) => ({ ...prev, status: "paused" }));
  };

  const resume = () => {
    setState((prev) => ({ ...prev, status: "running" }));
  };

  const reset = () => {
    clearTick();
    setState({ remaining: 0, status: "idle" });
  };

  useEffect(() => {
    if (state.status === "running") {
      startTick();
    }
    return clearTick;
  }, [state.status]);

  useEffect(() => {
    return clearTick;
  }, []);

  const minutes = Math.floor(state.remaining / 60);
  const seconds = state.remaining % 60;

  return {
    remaining: state.remaining,
    minutes,
    seconds,
    status: state.status,
    start,
    pause,
    resume,
    reset,
  };
}
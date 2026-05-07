import { useEffect, useRef, useState } from "react";
import { useTimerInput } from "@/features/timer/hooks/useTimerInput";
import { useTimerEngine } from "@/features/timer/hooks/useTimerEngine";
import { windowCommands } from "@/lib/tauri";
import { playAlarmSound } from "@/features/timer/utils";

type Field = "hrs" | "min" | "sec";
const FIELDS: Field[] = ["hrs", "min", "sec"];
const LABELS: Record<Field, string> = { hrs: "HRS", min: "MIN", sec: "SEC" };

export function TimerInput() {
  const input = useTimerInput();
  const engine = useTimerEngine();
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [rawValue, setRawValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (engine.status === "finished") {
      playAlarmSound();
      windowCommands.focus();
    }
  }, [engine.status]);

  useEffect(() => {
    if (activeField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeField]);

  const isIdle = engine.status === "idle";
  const isRunning = engine.status === "running";
  const isPaused = engine.status === "paused";

  const displayValue = (field: Field): string => {
    if (!isIdle) {
      if (field === "hrs") return String(Math.floor(engine.remaining / 3600)).padStart(2, "0");
      if (field === "min") return String(Math.floor((engine.remaining % 3600) / 60)).padStart(2, "0");
      return String(engine.remaining % 60).padStart(2, "0");
    }
    return String(input[field]).padStart(2, "0");
  };

  const handleFieldClick = (field: Field) => {
    if (!isIdle) return;
    setActiveField(field);
    setRawValue("");
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 2);
    setRawValue(digits);

    if (digits.length === 2) {
      const value = parseInt(digits, 10);
      input.setField(activeField!, value);

      const currentIndex = FIELDS.indexOf(activeField!);
      const nextField = FIELDS[currentIndex + 1];

      if (nextField) {
        setActiveField(nextField);
        setRawValue("");
      } else {
        setActiveField(null);
        setRawValue("");
      }
    }
  };

  const handleBlur = () => {
    if (rawValue.length > 0) {
      input.setField(activeField!, parseInt(rawValue, 10));
    }
    setActiveField(null);
    setRawValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" || e.key === "Enter") {
      if (rawValue.length > 0) {
        input.setField(activeField!, parseInt(rawValue, 10));
      }
      setActiveField(null);
      setRawValue("");
    }
  };

  const handleStartPause = () => {
    if (isIdle) engine.start(input.totalSeconds);
    else if (isRunning) engine.pause();
    else if (isPaused) engine.resume();
  };

  const handleReset = () => {
    engine.reset();
    input.reset();
  };

  const startLabel = isIdle ? "start" : isRunning ? "pause" : isPaused ? "resume" : "start";

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full h-full">

      {/* Hidden input for capturing keystrokes */}
      {activeField && (
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={rawValue}
          onChange={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="absolute opacity-0 w-0 h-0"
        />
      )}

      {/* Time fields */}
      <div className="flex flex-col items-center gap-1">
        {FIELDS.map((field) => (
          <div
            key={field}
            className="flex items-baseline gap-2 cursor-pointer select-none"
            onClick={() => handleFieldClick(field)}
          >
            <span
              className="font-bold leading-none transition-colors"
              style={{
                fontSize: "5rem",
                color: activeField === field
                  ? "var(--color-text-primary)"
                  : isIdle
                  ? input[field] > 0
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)"
                  : "var(--color-text-primary)",
                opacity: !isIdle && activeField !== field ? 0.9 : 1,
              }}
            >
              {activeField === field && rawValue.length > 0
                ? rawValue.padStart(2, "0")
                : displayValue(field)}
            </span>
            <span
              className="font-medium"
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
                letterSpacing: "0.1em",
              }}
            >
              {LABELS[field]}
            </span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleStartPause}
          disabled={isIdle && input.totalSeconds === 0}
          className="text-xs px-4 py-1 rounded-full transition-colors disabled:opacity-40"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
          }}
        >
          {startLabel}
        </button>

        <button
          onClick={handleReset}
          disabled={isIdle && input.totalSeconds === 0}
          className="text-xs px-4 py-1 rounded-full transition-colors disabled:opacity-30"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
          }}
        >
          reset
        </button>
      </div>
    </div>
  );
}
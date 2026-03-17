import { useEffect, useRef, useState } from "react";
import { useTimerInput } from "@/features/timer/hooks/useTimerInput";
import { useTimerEngine } from "@/features/timer/hooks/useTimerEngine";
import { windowCommands } from "@/lib/tauri";
import { playAlarmSound, parseTimerInput } from "@/features/timer/utils";

export function TimerInput() {
  const input = useTimerInput();
  const engine = useTimerEngine();
  const [isEditing, setIsEditing] = useState(false);
  const [rawInput, setRawInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (engine.status === "finished") {
      playAlarmSound();
      windowCommands.focus();
    }
  }, [engine.status]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const isIdle = engine.status === "idle";
  const isRunning = engine.status === "running";
  const isPaused = engine.status === "paused";

  const displayMinutes = isIdle ? input.minutes : engine.minutes;
  const displaySeconds = isIdle ? input.seconds : engine.seconds;

  const handleReset = () => {
    engine.reset();
    input.reset();
  };

  const handleStartPause = () => {
    if (isIdle) engine.start(input.totalSeconds);
    else if (isRunning) engine.pause();
    else if (isPaused) engine.resume();
  };

  const startLabel =
    isIdle ? "Start" :
    isRunning ? "Pause" :
    isPaused ? "Resume" :
    "reset";

  const confirmEdit = () => {
    const total = parseTimerInput(rawInput);
    if (total > 0) {
      input.adjust(total - input.totalSeconds);
    }
    setIsEditing(false);
    setRawInput("");
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setRawInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") confirmEdit();
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <AdjustButton label="-5" onClick={() => input.adjust(-300)} disabled={!isIdle} />
          <AdjustButton label="-1" onClick={() => input.adjust(-60)} disabled={!isIdle} />
        </div>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value.replace(/\D/g, ""))}
            onBlur={confirmEdit}
            onKeyDown={handleKeyDown}
            className="w-24 text-2xl font-mono outline-none text-center transition-colors bg-transparent"
            style={{
              borderBottom: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
            }}
            maxLength={6}
          />
        ) : (
          <span
            onClick={() => isIdle && setIsEditing(true)}
            className="text-2xl font-mono w-24 text-center transition-colors"
            style={{
              color: "var(--color-text-primary)",
              cursor: isIdle ? "pointer" : "default",
            }}
            title={isIdle ? "Click to edit" : undefined}
          >
            {String(displayMinutes).padStart(2, "0")}:
            {String(displaySeconds).padStart(2, "0")}
          </span>
        )}

        <div className="flex items-center gap-1">
          <AdjustButton label="+1" onClick={() => input.adjust(60)} disabled={!isIdle} />
          <AdjustButton label="+5" onClick={() => input.adjust(300)} disabled={!isIdle} />
        </div>
      </div>

      <div className="flex items-center gap-2">
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
          disabled={isIdle}
          className="text-xs px-4 py-1 rounded-full transition-colors disabled:opacity-30"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

interface AdjustButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function AdjustButton({ label, onClick, disabled }: AdjustButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-xs w-8 h-8 rounded-full transition-colors disabled:opacity-30"
      style={{
        border: "1px solid var(--color-border)",
        color: "var(--color-text-secondary)",
      }}
    >
      {label}
    </button>
  );
}
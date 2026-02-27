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
    isIdle ? "start" :
    isRunning ? "pause" :
    isPaused ? "resume" :
    "reset";

  const confirmEdit = () => {
    const total = parseTimerInput(rawInput);
    if (total > 0) {
      const minutes = Math.floor(total / 60);
      const seconds = total % 60;
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
            className="w-24 text-2xl font-mono text-zinc-100 bg-transparent border-b border-zinc-600 focus:border-zinc-400 outline-none text-center transition-colors"
            maxLength={6}
          />
        ) : (
          <span
            onClick={() => isIdle && setIsEditing(true)}
            className={`text-2xl font-mono text-zinc-100 w-24 text-center ${isIdle ? "cursor-pointer hover:text-zinc-400 transition-colors" : ""}`}
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
    className="text-xs px-4 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-40 transition-colors"
  >
    {startLabel}
  </button>

        {!isIdle && (
          <button
            onClick={handleReset}
            className="text-xs px-4 py-1 rounded-full border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
          >
            reset
          </button>
        )}
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
      className="text-xs w-8 h-8 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-30 transition-colors"
    >
      {label}
    </button>
  );
}
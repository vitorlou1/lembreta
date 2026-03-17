import { useState } from "react";
import type { CreateTaskInput } from "@/features/tasks/types";

interface TaskFormProps {
  onSubmit: (input: CreateTaskInput) => void;
  isLoading?: boolean;
}

export function TaskForm({ onSubmit, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && title.trim()) {
      onSubmit({ title });
      setTitle("");
    }
  };

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <input
        type="text"
        placeholder=""
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className="task-input"
      />
      <div className="task-input-border" />
    </div>
  );
}
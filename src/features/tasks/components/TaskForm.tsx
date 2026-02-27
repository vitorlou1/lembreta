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
    <input
      type="text"
      placeholder="New task..."
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={isLoading}
      className="w-full bg-transparent border-b border-zinc-700 focus:border-zinc-400 outline-none text-sm text-zinc-100 placeholder:text-zinc-600 py-1 transition-colors"
    />
  );
}
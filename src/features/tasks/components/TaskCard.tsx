import { Card } from "@/components/ui/card";
import type { Task, TaskStatus } from "@/features/tasks/types";

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onRemove: (id: string) => void;
}

export function TaskCard({ task, onStatusChange, onRemove }: TaskCardProps) {
  const isDone = task.status === "done";

  const handleToggle = () => {
    onStatusChange(task.id, isDone ? "todo" : "done");
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 px-4 py-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isDone}
          onChange={handleToggle}
          className="accent-zinc-400 cursor-pointer shrink-0"
          aria-label={`Mark "${task.title}" as ${isDone ? "incomplete" : "complete"}`}
        />
        <span
          className={`text-sm flex-1 ${
            isDone ? "line-through text-zinc-500" : "text-zinc-100"
          }`}
        >
          {task.title}
        </span>
        <button
          onClick={() => onRemove(task.id)}
          className="text-zinc-600 hover:text-zinc-300 transition-colors text-xs shrink-0"
          aria-label="Remove task"
        >
          ✕
        </button>
      </div>
    </Card>
  );
}
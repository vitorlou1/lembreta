import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/types";

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onRemove: (id: string) => void;
}

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-zinc-700 text-zinc-300",
  medium: "bg-yellow-900 text-yellow-300",
  high: "bg-red-900 text-red-300",
};

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-zinc-700 text-zinc-300",
  in_progress: "bg-blue-900 text-blue-300",
  done: "bg-green-900 text-green-300",
};

const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export function TaskCard({ task, onStatusChange, onRemove }: TaskCardProps) {
  const isDone = task.status === "done";

  return (
    <Card className="bg-zinc-900 border-zinc-800 px-4 py-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-sm font-medium leading-snug ${
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

      {task.description && (
        <p className="text-xs text-zinc-500 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`text-xs px-2 py-0.5 rounded-full border-0 ${priorityStyles[task.priority]}`}>
          {task.priority}
        </Badge>

        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className={`text-xs px-2 py-0.5 rounded-full border-0 outline-none cursor-pointer ${statusStyles[task.status]}`}
        >
          {Object.entries(statusLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {task.dueDate && (
          <span className="text-xs text-zinc-500 ml-auto">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </Card>
  );
}
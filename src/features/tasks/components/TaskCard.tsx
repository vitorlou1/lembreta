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
    <div
      className="px-4 py-3 rounded-lg mb-2"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isDone}
          onChange={handleToggle}
          className="cursor-pointer shrink-0"
          style={{ accentColor: "#00A884" }}
          aria-label={`Mark "${task.title}" as ${isDone ? "incomplete" : "complete"}`}
        />
        <span
          className="text-sm flex-1"
          style={{
            color: isDone ? "var(--color-text-secondary)" : "var(--color-text-primary)",
            textDecoration: isDone ? "line-through" : "none",
          }}
        >
          {task.title}
        </span>
        <button
          onClick={() => onRemove(task.id)}
          className="transition-colors text-xs shrink-0 hover:text-red-400"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="Remove task"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
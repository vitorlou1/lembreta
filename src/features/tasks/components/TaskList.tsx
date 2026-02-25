import { TaskCard } from "@/features/tasks/components/TaskCard";
import type { Task, TaskStatus } from "@/features/tasks/types";

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onRemove: (id: string) => void;
}

export function TaskList({ tasks, onStatusChange, onRemove }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <span className="text-zinc-600 text-sm">No tasks yet.</span>
        <span className="text-zinc-700 text-xs">Add one above to get started.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
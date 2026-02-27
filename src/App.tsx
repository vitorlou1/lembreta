import { useState } from "react";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import { TaskList } from "@/features/tasks/components/TaskList";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { TimerInput } from "@/features/timer/components/TimerInput";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import type { TaskStatus } from "@/features/tasks/types";

export default function App() {
  const { tasks, isLoading, error, createTask, updateTask, removeTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
  };

  const completedTasks = tasks.filter((t) => t.status === "done");

  const handleClearCompleted = () => {
    completedTasks.forEach((t) => removeTask(t.id));
    setIsModalOpen(false);
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col px-4 py-3 gap-3 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-end flex-shrink-0 h-4">
        {completedTasks.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            title="Clear completed tasks"
            className="text-zinc-600 hover:text-red-400 transition-colors"
            aria-label="Clear completed tasks"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        )}
      </div>

      {/* Scrollable task list */}
      {error && <p className="text-xs text-red-400 flex-shrink-0">{error}</p>}
      <div className="flex-1 overflow-y-auto pr-1">
        <TaskList
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onRemove={removeTask}
        />
      </div>

      {/* Static form */}
      <div className="flex-shrink-0">
        <TaskForm onSubmit={createTask} isLoading={isLoading} />
      </div>

      {/* Static divider */}
      <div className="border-t border-zinc-800 flex-shrink-0" />

      {/* Static timer */}
      <div className="flex-shrink-0">
        <TimerInput />
      </div>

      {/* Confirmation modal */}
      {isModalOpen && (
        <ConfirmModal
          message={`Remove ${completedTasks.length} completed ${completedTasks.length === 1 ? "task" : "tasks"}?`}
          onConfirm={handleClearCompleted}
          onCancel={() => setIsModalOpen(false)}
        />
      )}

    </div>
  );
}
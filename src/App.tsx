import { useState } from "react";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import { TaskList } from "@/features/tasks/components/TaskList";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { TimerInput } from "@/features/timer/components/TimerInput";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { windowCommands } from "@/lib/tauri";
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
    <div
      className="h-screen flex flex-col px-4 py-3 gap-3 overflow-hidden"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between flex-shrink-0 h-8 -mx-4 -mt-3 px-4 mb-1"
        data-tauri-drag-region
      >
        {/* Left — clear completed */}
        <div>
          {completedTasks.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              title="Clear completed tasks"
              aria-label="Clear completed tasks"
              className="text-xs px-3 py-1 rounded-full transition-colors"
              style={{
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Right — window controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => windowCommands.minimize()}
            className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors"
            aria-label="Minimize"
          />
          <button
            onClick={() => windowCommands.close()}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
            aria-label="Close"
          />
        </div>
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
      <div className="flex-shrink-0" style={{ borderTop: "1px solid var(--color-border)" }} />

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
import { useState } from "react";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import { TaskList } from "@/features/tasks/components/TaskList";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { TimerInput } from "@/features/timer/components/TimerInput";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { windowCommands } from "@/lib/tauri";
import type { TaskStatus } from "@/features/tasks/types";

type Tab = "tarefas" | "crono";

export default function App() {
  const { tasks, isLoading, error, createTask, updateTask, removeTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("tarefas");

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
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between flex-shrink-0 px-4 pt-3 pb-0"
        data-tauri-drag-region
      >
        {/* Tabs */}
        <div className="flex items-center gap-4">
          {(["tarefas", "crono"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-xs pb-1 transition-colors"
              style={{
                color: activeTab === tab ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                borderBottom: activeTab === tab ? "1px solid var(--color-text-primary)" : "1px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Window controls */}
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

      {/* Divider */}
      <div className="flex-shrink-0 mx-4 mt-2" style={{ borderTop: "1px solid var(--color-border)" }} />

      {/* Tab: tarefas */}
      {activeTab === "tarefas" && (
        <div className="flex flex-col flex-1 overflow-hidden px-4 pt-2 pb-3 gap-2">

          {/* Clear completed */}
         <div className="flex justify-end flex-shrink-0" style={{ minHeight: 0 }}>
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
                clear
              </button>
            )}
          </div>

          {/* Task list */}
          {error && <p className="text-xs text-red-400 flex-shrink-0">{error}</p>}
          <div className="flex-1 overflow-y-auto pr-1 -mx-4 px-4">
            <TaskList
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onRemove={removeTask}
            />
          </div>

          {/* Task form */}
          <div className="flex-shrink-0">
            <TaskForm onSubmit={createTask} isLoading={isLoading} />
          </div>

        </div>
      )}

      {/* Tab: crono */}
      {activeTab === "crono" && (
        <div className="flex flex-1 items-center justify-center">
          <TimerInput />
        </div>
      )}

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
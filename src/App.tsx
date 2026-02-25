import { TaskForm } from "@/features/tasks/components/TaskForm";
import { TaskList } from "@/features/tasks/components/TaskList";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import type { TaskStatus } from "@/features/tasks/types";

export default function App() {
  const { tasks, isLoading, error, createTask, updateTask, removeTask } = useTasks();

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-tight">Lembreta</h1>
          <p className="text-xs text-zinc-500">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        <TaskForm onSubmit={createTask} isLoading={isLoading} />

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <TaskList
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onRemove={removeTask}
        />
      </div>
    </div>
  );
}
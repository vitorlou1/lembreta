import { useState, useEffect, useCallback } from "react";
import { taskCommands } from "@/lib/tauri";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/features/tasks/types";

interface UseTasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

export function useTasks() {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    isLoading: true,
    error: null,
  });

  const fetchTasks = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const tasks = await taskCommands.getAll();
      setState({ tasks, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load tasks.",
      }));
    }
  }, []);

  const createTask = useCallback(async (input: CreateTaskInput) => {
    try {
      const task = await taskCommands.create(input);
      setState((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: "Failed to create task." }));
    }
  }, []);

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput) => {
    try {
      const updated = await taskCommands.update(id, input);
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: "Failed to update task." }));
    }
  }, []);

  const removeTask = useCallback(async (id: string) => {
    try {
      await taskCommands.remove(id);
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: "Failed to delete task." }));
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks: state.tasks,
    isLoading: state.isLoading,
    error: state.error,
    createTask,
    updateTask,
    removeTask,
    refetch: fetchTasks,
  };
}
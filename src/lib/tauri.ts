import { invoke } from "@tauri-apps/api/core";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/features/tasks/types";

export const taskCommands = {
  getAll: (): Promise<Task[]> => {
    return invoke("get_all_tasks");
  },

  create: (input: CreateTaskInput): Promise<Task> => {
    return invoke("create_task", { input });
  },

  update: (id: string, input: UpdateTaskInput): Promise<Task> => {
    return invoke("update_task", { id, input });
  },

  remove: (id: string): Promise<void> => {
    return invoke("delete_task", { id });
  },
};
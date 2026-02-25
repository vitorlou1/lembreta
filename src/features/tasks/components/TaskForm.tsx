import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateTaskInput, TaskPriority } from "@/features/tasks/types";

interface TaskFormProps {
  onSubmit: (input: CreateTaskInput) => void;
  isLoading?: boolean;
}

const defaultState: CreateTaskInput = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: undefined,
};

export function TaskForm({ onSubmit, isLoading }: TaskFormProps) {
  const [form, setForm] = useState<CreateTaskInput>(defaultState);

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit(form);
    setForm(defaultState);
  };

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder="Task title"
        value={form.title}
        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
      />

      <Textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 resize-none"
        rows={2}
      />

      <div className="flex items-center gap-2">
        <Select
          value={form.priority}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, priority: value as TaskPriority }))
          }
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={form.dueDate ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              dueDate: e.target.value || undefined,
            }))
          }
          className="bg-zinc-900 border-zinc-800 text-zinc-100 w-40"
        />

        <Button
          onClick={handleSubmit}
          disabled={!form.title.trim() || isLoading}
          className="ml-auto"
        >
          Add task
        </Button>
      </div>
    </div>
  );
}
interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-6 py-5 flex flex-col gap-4 w-72"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-zinc-100">{message}</p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-xs px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-xs px-3 py-1.5 rounded bg-red-900 text-red-200 hover:bg-red-800 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
import { createPortal } from "react-dom";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/** A centered Yes/No confirmation modal. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  danger,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Portaled to <body> — this can be opened from inside TopBar (e.g. the
  // Leave-game confirm, via LeaveButton), a positioned/z-indexed ancestor
  // that would otherwise trap this fixed overlay below other z-indexed
  // elements elsewhere on the page, no matter how high its own z-index is.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-panel p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-400">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-muted transition hover:bg-white/5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition active:scale-95 ${
              danger ? "bg-red-500/90 hover:bg-red-500" : "cta-gradient text-[#0a0b14]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

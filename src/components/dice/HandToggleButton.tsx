import { Dices } from "lucide-react";

type HandToggleButtonProps = {
  open: boolean;
  onClick: () => void;
};

/** Top-bar button that opens/closes the Hand pane. */
export function HandToggleButton({ open, onClick }: HandToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={open}
      aria-label="Toggle hand"
      className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
        open
          ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
          : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
      }`}
    >
      <Dices size={20} aria-hidden="true" />
      <span className="hidden sm:inline">Hand</span>
    </button>
  );
}

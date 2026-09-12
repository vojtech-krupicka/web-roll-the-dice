import { SkipForward } from "lucide-react";

type NextPlayerButtonProps = {
  disabled: boolean;
  onClick: () => void;
};

/** Smaller secondary button next to Roll — advances to the next player. */
export function NextPlayerButton({ disabled, onClick }: NextPlayerButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-neutral-300 px-4 py-3 text-xs font-semibold text-neutral-700 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
    >
      <SkipForward size={20} aria-hidden="true" />
      Next player
    </button>
  );
}

import { SkipForward } from "lucide-react";

type NextPlayerPillProps = {
  disabled: boolean;
  onClick: () => void;
};

/** Edge-docked pill flush to the right screen border — advances to the next player. */
export function NextPlayerPill({ disabled, onClick }: NextPlayerPillProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="absolute right-[-16px] bottom-[114px] z-[3] flex h-11 items-center gap-1.5 rounded-l-full border border-r-0 border-border bg-panel py-2 pr-4 pl-3 shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40"
    >
      <SkipForward size={16} className="shrink-0 text-muted" aria-hidden="true" />
      <span className="text-sm font-semibold text-muted">Next</span>
    </button>
  );
}

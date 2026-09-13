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
      className="group absolute right-[-16px] bottom-[114px] z-[8] flex h-11 cursor-pointer items-center gap-1.5 rounded-l-full border border-r-0 border-border bg-panel py-2 pr-4 pl-3 shadow-lg transition-colors hover:border-accent-cyan/40 hover:bg-panel-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-panel disabled:active:scale-100"
    >
      <SkipForward
        size={16}
        className="shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent-cyan group-disabled:translate-x-0 group-disabled:text-muted"
        aria-hidden="true"
      />
      <span className="text-sm font-semibold text-muted transition-colors group-hover:text-accent-cyan group-disabled:text-muted">
        Next
      </span>
    </button>
  );
}

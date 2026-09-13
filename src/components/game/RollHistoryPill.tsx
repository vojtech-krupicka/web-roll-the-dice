import { ChevronRight } from "lucide-react";
import type { PlayerSummary } from "@/lib/players";
import type { RollSummary } from "@/lib/rolls";

type RollHistoryPillProps = {
  lastRoll: RollSummary | undefined;
  lastRollPlayer: PlayerSummary | undefined;
  onClick: () => void;
};

/** Edge-docked pill flush to the left screen border — shows the last roll, opens full history. */
export function RollHistoryPill({ lastRoll, lastRollPlayer, onClick }: RollHistoryPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute bottom-[114px] left-[-16px] z-[3] flex h-11 max-w-[190px] cursor-pointer items-center gap-1.5 rounded-r-full border border-l-0 border-border bg-panel py-2 pr-3 pl-4 shadow-lg transition-colors hover:border-accent-cyan/40 hover:bg-white/5 active:scale-[0.97]"
    >
      {lastRoll && lastRollPlayer ? (
        <>
          <span className="truncate text-sm font-bold" style={{ color: lastRollPlayer.color }}>
            {lastRollPlayer.name}
          </span>
          <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">{lastRoll.data.sum}</span>
        </>
      ) : (
        <span className="text-sm font-semibold text-faint">No rolls yet</span>
      )}
      <ChevronRight
        size={14}
        className="shrink-0 text-faint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent-cyan"
        aria-hidden="true"
      />
    </button>
  );
}

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
      className="absolute bottom-[114px] left-[-16px] z-[3] flex h-11 max-w-[190px] items-center gap-1.5 rounded-r-full border border-l-0 border-border bg-panel py-2 pr-3 pl-4 shadow-lg"
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
      <ChevronRight size={14} className="shrink-0 text-faint" aria-hidden="true" />
    </button>
  );
}

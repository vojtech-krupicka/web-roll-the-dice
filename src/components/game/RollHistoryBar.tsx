import type { PlayerSummary } from "@/lib/players";
import type { RollSummary } from "@/lib/rolls";

type RollHistoryBarProps = {
  lastRoll: RollSummary | undefined;
  lastRollPlayer: PlayerSummary | undefined;
  onClick: () => void;
};

/** Footer bar — shows the most recent roll, opens the full history. */
export function RollHistoryBar({ lastRoll, lastRollPlayer, onClick }: RollHistoryBarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 shrink-0 items-center justify-center gap-2 border-t border-neutral-200 bg-background text-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
    >
      {lastRoll && lastRollPlayer ? (
        <>
          <span aria-hidden="true">{lastRollPlayer.icon}</span>
          <span className="font-semibold" style={{ color: lastRollPlayer.color }}>
            {lastRollPlayer.name}
          </span>
          <span className="text-neutral-500 dark:text-neutral-400">rolled</span>
          <span className="text-lg font-bold tabular-nums">{lastRoll.data.sum}</span>
        </>
      ) : (
        <span className="text-neutral-500 dark:text-neutral-400">No rolls yet</span>
      )}
    </button>
  );
}

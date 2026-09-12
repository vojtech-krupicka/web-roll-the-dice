import type { PlayerSummary } from "@/lib/players";

type CurrentPlayerBarProps = {
  player: PlayerSummary | undefined;
  onClick: () => void;
};

/** Bar under the top bar — shows and opens the current player. */
export function CurrentPlayerBar({ player, onClick }: CurrentPlayerBarProps) {
  if (!player) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 shrink-0 items-center justify-center gap-2 border-b border-neutral-200 bg-background text-sm font-semibold transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
      style={{ color: player.color }}
    >
      <span aria-hidden="true">{player.icon}</span>
      <span className="truncate">{player.name}</span>
      {!player.enabled && (
        <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500">(disabled)</span>
      )}
    </button>
  );
}

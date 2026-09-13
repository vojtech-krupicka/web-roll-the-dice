import type { PlayerSummary } from "@/lib/players";

type CurrentPlayerBadgeProps = {
  player: PlayerSummary | undefined;
  onClick: () => void;
};

/** Avatar-over-pill badge docked top-left of the drop area — shows and opens the current player's settings. */
export function CurrentPlayerBadge({ player, onClick }: CurrentPlayerBadgeProps) {
  if (!player) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit ${player.name}${player.enabled ? "" : " (disabled)"}`}
      className="absolute top-[14px] left-[14px] z-[3] cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:scale-95"
      style={{ opacity: player.enabled ? 1 : 0.5 }}
    >
      <div
        className="ml-5 flex h-[34px] items-center rounded-full pr-4 pl-[26px] text-sm font-bold transition-colors hover:bg-white/5"
        style={{ background: "#12131f", border: `1.5px solid ${player.color}66`, color: player.color }}
      >
        <span className="max-w-[110px] truncate">{player.name}</span>
      </div>
      <div
        className="absolute top-1/2 left-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-lg"
        style={{ background: "#0a0b14", boxShadow: `0 0 0 1.5px ${player.color}, 0 0 10px ${player.color}99` }}
      >
        {player.icon}
      </div>
    </button>
  );
}

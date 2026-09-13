import type { ReactNode } from "react";
import { Dices, Users } from "lucide-react";

type BottomBarProps = {
  active: "players" | "hand" | null;
  onPlayers: () => void;
  onHand: () => void;
};

/** Full-bleed bottom navigation — Players and Hand — shared by the main screen and every dialog shell. */
export function BottomBar({ active, onPlayers, onHand }: BottomBarProps) {
  return (
    <div className="absolute right-[-16px] bottom-0 left-[-16px] z-[2] flex h-[100px] items-center justify-between border-t border-border bg-panel px-8">
      <NavButton
        icon={<Users size={19} strokeWidth={1.9} aria-hidden="true" />}
        label="Players"
        active={active === "players"}
        onClick={onPlayers}
      />
      <NavButton
        icon={<Dices size={19} strokeWidth={1.9} aria-hidden="true" />}
        label="Hand"
        active={active === "hand"}
        onClick={onHand}
      />
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex flex-col items-center gap-1.5 rounded-xl px-3 py-1.5 transition hover:bg-white/5 active:scale-95 ${
        active ? "text-accent-cyan" : "text-muted hover:text-[#cbd5e1]"
      }`}
    >
      <span className="inline-flex transition-transform duration-150 group-hover:scale-110">{icon}</span>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

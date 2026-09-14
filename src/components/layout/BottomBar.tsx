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
    <div className="absolute right-[-16px] bottom-0 left-[-16px] z-[2] flex h-[100px] border-t border-border bg-panel">
      <NavButton
        icon={<Users size={22} strokeWidth={1.9} aria-hidden="true" />}
        label="Players"
        active={active === "players"}
        onClick={onPlayers}
        side="left"
      />
      <NavButton
        icon={<Dices size={22} strokeWidth={1.9} aria-hidden="true" />}
        label="Hand"
        active={active === "hand"}
        onClick={onHand}
        side="right"
      />
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
  side,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  side: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex h-full w-1/2 cursor-pointer flex-col items-center justify-center gap-2 transition-colors hover:bg-white/5 active:scale-[0.97] ${
        active ? "text-accent-cyan" : "text-muted hover:text-white"
      }`}
    >
      <span
        className={`inline-flex transition-transform duration-150 group-hover:scale-110 ${
          side === "left" ? "-translate-x-3" : "translate-x-3"
        }`}
      >
        {icon}
      </span>
      <span
        className={`text-[13px] font-bold transition-transform duration-150 group-hover:scale-110 ${
          side === "left" ? "-translate-x-3" : "translate-x-3"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

import type { DieSides } from "@/lib/hand";
import { DieSprite } from "./DieSprite";

export type DropAreaDie = {
  key: string;
  sides: DieSides;
  face: number;
  /** False while this die is still mid-roll — dims it and drops its glow until it settles. */
  settled: boolean;
};

type DropAreaProps = {
  dice: DropAreaDie[];
  /** Tints every die in this color — the current player's color. */
  color?: string;
};

const SIZE_CLASS: Partial<Record<DieSides, string>> = {
  20: "h-[76px] w-[76px]",
  6: "h-[66px] w-[66px]",
  8: "h-[66px] w-[66px]",
  4: "h-[62px] w-[62px]",
};
const DEFAULT_SIZE_CLASS = "h-[60px] w-[60px]";

/** The dice drop-off area — dark panel + grid backdrop, dice clustered and vertically centered. */
export function DropArea({ dice, color }: DropAreaProps) {
  return (
    <div className="absolute inset-0 z-[1] overflow-hidden rounded-[20px] border border-border bg-panel-inset">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-[62px] right-0 bottom-[148px] left-0 flex flex-wrap content-center items-center justify-center gap-5">
        {dice.map((die) => (
          <DieSprite
            key={die.key}
            sides={die.sides}
            value={die.face}
            color={color}
            className={`transition-all duration-150 ${SIZE_CLASS[die.sides] ?? DEFAULT_SIZE_CLASS} ${
              die.settled
                ? "opacity-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] brightness-100"
                : "opacity-80 drop-shadow-none brightness-[0.55]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

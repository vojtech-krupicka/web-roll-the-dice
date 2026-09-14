import type { DieTumble } from "@/lib/dice";
import type { DieSides } from "@/lib/hand";
import { DieSprite } from "./DieSprite";

export type DropAreaDie = {
  key: string;
  sides: DieSides;
  face: number;
  /** False while this die is still mid-roll — dims it and drops its glow until it settles. */
  settled: boolean;
  /** Random offset/rotation applied while mid-roll, for the tumble effect. */
  tumble: DieTumble;
};

type DropAreaProps = {
  dice: DropAreaDie[];
  /** Tints every die in this color — the current player's color. */
  color?: string;
  /** Blurs the whole area — used while the result banner is showing. */
  blurred?: boolean;
};

const SIZE_CLASS: Partial<Record<DieSides, string>> = {
  20: "h-[76px] w-[76px]",
  6: "h-[66px] w-[66px]",
  8: "h-[66px] w-[66px]",
  4: "h-[62px] w-[62px]",
};
const DEFAULT_SIZE_CLASS = "h-[60px] w-[60px]";

/** The dice drop-off area — dark panel + grid backdrop, dice clustered and vertically centered. */
export function DropArea({ dice, color, blurred }: DropAreaProps) {
  return (
    <div
      className={`absolute inset-0 z-[1] overflow-hidden rounded-[20px] border border-border bg-panel-inset transition-[filter] duration-300 ${
        blurred ? "blur-md" : ""
      }`}
    >
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
          <div
            key={die.key}
            className="transition-transform duration-200 ease-out"
            style={{ transform: `translate(${die.tumble.x}px, ${die.tumble.y}px) rotate(${die.tumble.rot}deg)` }}
          >
            <DieSprite
              sides={die.sides}
              value={die.face}
              color={color}
              className={`transition-all duration-150 ${SIZE_CLASS[die.sides] ?? DEFAULT_SIZE_CLASS} ${
                die.settled
                  ? "opacity-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] brightness-100"
                  : "opacity-80 drop-shadow-none brightness-[0.55]"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

import type { DieSides } from "@/lib/hand";
import { DieSprite } from "./DieSprite";

export type DropAreaDie = {
  key: string;
  sides: DieSides;
  face: number;
};

type DropAreaProps = {
  dice: DropAreaDie[];
  /** Tints every die in this color — the current player's color. */
  color?: string;
};

/** The dice drop-off area — shows every die currently in the hand. */
export function DropArea({ dice, color }: DropAreaProps) {
  return (
    <div className="flex flex-[2] flex-wrap items-center justify-center gap-4 bg-neutral-100 p-6 dark:bg-neutral-900/60">
      {dice.map((die) => (
        <div key={die.key} className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            d{die.sides}
          </span>
          <DieSprite
            sides={die.sides}
            value={die.face}
            color={color}
            className="h-24 w-24 drop-shadow-xl sm:h-32 sm:w-32"
          />
        </div>
      ))}
    </div>
  );
}

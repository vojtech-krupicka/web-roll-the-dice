import type { DieSides } from "@/lib/hand";
import { DieSprite } from "./DieSprite";

export type DropAreaDie = {
  key: string;
  sides: DieSides;
  face: number;
};

type DropAreaProps = {
  dice: DropAreaDie[];
};

/** The dice drop-off area — shows every die currently in the hand. */
export function DropArea({ dice }: DropAreaProps) {
  return (
    <div className="flex flex-[2] flex-wrap items-center justify-center gap-4 bg-neutral-100 p-6 dark:bg-neutral-900/60">
      {dice.map((die) => (
        <DieSprite
          key={die.key}
          sides={die.sides}
          value={die.face}
          className="h-24 w-24 drop-shadow-xl sm:h-32 sm:w-32"
        />
      ))}
    </div>
  );
}

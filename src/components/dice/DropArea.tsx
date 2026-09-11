import { DieFace } from "./DieFace";

type DropAreaProps = {
  value: number;
};

/** The dice drop-off area — where rolled dice are shown. */
export function DropArea({ value }: DropAreaProps) {
  return (
    <div className="flex flex-[2] items-center justify-center bg-neutral-100 dark:bg-neutral-900/60">
      <DieFace
        value={value}
        className="h-36 w-36 drop-shadow-xl sm:h-44 sm:w-44"
      />
    </div>
  );
}

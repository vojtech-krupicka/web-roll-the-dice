import type { DieSides, HandEntry } from "@/lib/hand";
import { HandRow } from "./HandRow";

type HandPaneProps = {
  hand: HandEntry[];
  error: string | null;
  onToggleEnabled: (sides: DieSides) => void;
  onIncrement: (sides: DieSides) => void;
  onDecrement: (sides: DieSides) => void;
};

/** Overlay panel for editing the current hand — covers the drop area while open. */
export function HandPane({ hand, error, onToggleEnabled, onIncrement, onDecrement }: HandPaneProps) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-y-auto bg-background px-6 py-4">
      <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        Your hand
      </h2>

      <div className="mt-2 divide-y divide-neutral-200 dark:divide-neutral-800">
        {hand.map((entry) => (
          <HandRow
            key={entry.sides}
            entry={entry}
            onToggleEnabled={() => onToggleEnabled(entry.sides)}
            onIncrement={() => onIncrement(entry.sides)}
            onDecrement={() => onDecrement(entry.sides)}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

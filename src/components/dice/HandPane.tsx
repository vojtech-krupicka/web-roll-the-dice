import { useState } from "react";
import { Plus } from "lucide-react";
import { DIE_TYPES, type DieSides, type HandEntry } from "@/lib/hand";
import { HandRow } from "./HandRow";
import { AddDiePopup } from "./AddDiePopup";

type HandPaneProps = {
  hand: HandEntry[];
  color?: string;
  error: string | null;
  onToggleEnabled: (sides: DieSides) => void;
  onIncrement: (sides: DieSides) => void;
  onDecrement: (sides: DieSides) => void;
  onAddDieType: (sides: DieSides) => void;
};

/** Overlay panel for editing the current hand — covers the drop area while open. */
export function HandPane({
  hand,
  color,
  error,
  onToggleEnabled,
  onIncrement,
  onDecrement,
  onAddDieType,
}: HandPaneProps) {
  const [addDieOpen, setAddDieOpen] = useState(false);
  const allTypesAdded = hand.length >= DIE_TYPES.length;

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
            color={color}
            onToggleEnabled={() => onToggleEnabled(entry.sides)}
            onIncrement={() => onIncrement(entry.sides)}
            onDecrement={() => onDecrement(entry.sides)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setAddDieOpen(true)}
        disabled={allTypesAdded}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
      >
        <Plus size={18} aria-hidden="true" />
        Add die
      </button>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {addDieOpen && (
        <AddDiePopup
          existingSides={hand.map((entry) => entry.sides)}
          onSelect={(sides) => {
            onAddDieType(sides);
            setAddDieOpen(false);
          }}
          onDismiss={() => setAddDieOpen(false)}
        />
      )}
    </div>
  );
}

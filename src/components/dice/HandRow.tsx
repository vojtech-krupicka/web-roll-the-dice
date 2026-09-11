import { Minus, Plus } from "lucide-react";
import type { HandEntry } from "@/lib/hand";

type HandRowProps = {
  entry: HandEntry;
  onToggleEnabled: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

/** One row in the Hand pane: enable checkbox, die type, and a +/- count control. */
export function HandRow({ entry, onToggleEnabled, onIncrement, onDecrement }: HandRowProps) {
  const { sides, enabled, count } = entry;

  return (
    <div className="flex items-center gap-4 py-3">
      <input
        type="checkbox"
        checked={enabled}
        onChange={onToggleEnabled}
        aria-label={`Enable d${sides}`}
        className="h-5 w-5 shrink-0 accent-neutral-900 dark:accent-neutral-100"
      />

      <span
        className={`w-10 shrink-0 text-lg font-semibold ${
          enabled ? "" : "text-neutral-400 dark:text-neutral-600"
        }`}
      >
        d{sides}
      </span>

      <div className="flex flex-1 items-center justify-end gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={!enabled || count === 0}
          aria-label={`Decrease number of d${sides} dice`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-900 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-100"
        >
          <Minus size={18} />
        </button>

        <span className="w-6 text-center text-lg tabular-nums">{count}</span>

        <button
          type="button"
          onClick={onIncrement}
          disabled={!enabled}
          aria-label={`Increase number of d${sides} dice`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-900 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-100"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

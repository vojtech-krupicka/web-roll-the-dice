import { Minus, Plus } from "lucide-react";
import type { HandEntry } from "@/lib/hand";
import { DieSprite } from "./DieSprite";
import { Switch } from "@/components/ui/Switch";

type HandRowProps = {
  entry: HandEntry;
  color?: string;
  onToggleEnabled: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

/** One row in the Hand pane: enable switch, die type, and a +/- count control. */
export function HandRow({ entry, color, onToggleEnabled, onIncrement, onDecrement }: HandRowProps) {
  const { sides, enabled, count } = entry;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-panel px-3 py-3">
      <Switch checked={enabled} onChange={onToggleEnabled} aria-label={`Enable d${sides}`} />

      <DieSprite
        sides={sides}
        value={1}
        color={enabled ? color : undefined}
        className={`h-8 w-8 shrink-0 ${enabled ? "" : "opacity-40"}`}
      />

      <span className={`w-10 shrink-0 text-lg font-bold ${enabled ? "" : "text-faint"}`}>d{sides}</span>

      <div className="flex flex-1 items-center justify-end gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={!enabled || count === 0}
          aria-label={`Decrease number of d${sides} dice`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-[#cbd5e1] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={16} aria-hidden="true" />
        </button>

        <span className="w-6 text-center text-lg font-bold tabular-nums">{count}</span>

        <button
          type="button"
          onClick={onIncrement}
          disabled={!enabled}
          aria-label={`Increase number of d${sides} dice`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong text-[#cbd5e1] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

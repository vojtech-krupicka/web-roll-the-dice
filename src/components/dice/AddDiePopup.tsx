import { X } from "lucide-react";
import { DIE_TYPES, type DieSides } from "@/lib/hand";
import { DieSprite } from "./DieSprite";

type AddDiePopupProps = {
  existingSides: DieSides[];
  onSelect: (sides: DieSides) => void;
  onDismiss: () => void;
};

/** A 2x4 grid of every die type; types already in the hand are disabled. */
export function AddDiePopup({ existingSides, onSelect, onDismiss }: AddDiePopupProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-background p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Add die
          </h3>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="rounded-full p-1 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-4 grid-rows-2 gap-3">
          {DIE_TYPES.map((sides) => {
            const disabled = existingSides.includes(sides);
            return (
              <button
                key={sides}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(sides)}
                className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 p-2 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-800"
              >
                <DieSprite sides={sides} value={1} className="h-9 w-9" />
                <span className="text-xs font-medium">d{sides}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

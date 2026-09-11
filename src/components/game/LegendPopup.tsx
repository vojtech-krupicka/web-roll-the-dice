import { X } from "lucide-react";
import { DIE_TYPES } from "@/lib/hand";
import { DieSprite } from "@/components/dice/DieSprite";

type LegendPopupProps = {
  onDismiss: () => void;
};

/** Read-only reference grid of every die type — same layout as Add Die, but not interactive. */
export function LegendPopup({ onDismiss }: LegendPopupProps) {
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
            Legend
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
          {DIE_TYPES.map((sides) => (
            <div
              key={sides}
              className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 p-2 dark:border-neutral-800"
            >
              <DieSprite sides={sides} value={1} className="h-9 w-9" />
              <span className="text-xs font-medium">d{sides}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-panel p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[10px] font-bold tracking-[0.1em] text-faint uppercase">Legend</h3>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="rounded-full p-1 text-muted transition hover:bg-white/5"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-4 grid-rows-2 gap-3">
          {DIE_TYPES.map((sides) => (
            <div
              key={sides}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-panel-inset p-2"
            >
              <DieSprite sides={sides} value={1} className="h-9 w-9" />
              <span className="text-xs font-medium text-muted">d{sides}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { DIE_TYPES, type DieSides, type HandEntry } from "@/lib/hand";
import { DieSprite } from "./DieSprite";
import { DialogShell, type DialogBottomNav } from "@/components/ui/DialogShell";

type AddDiePopupProps = {
  existingEntries: HandEntry[];
  bottomNav: DialogBottomNav;
  onSelect: (sides: DieSides) => void;
  onDismiss: () => void;
};

/** A 2x4 grid of every die type; types already in the hand are disabled and show their count. */
export function AddDiePopup({ existingEntries, bottomNav, onSelect, onDismiss }: AddDiePopupProps) {
  return (
    <DialogShell
      title="Add die"
      bottomNav={bottomNav}
      onDismiss={onDismiss}
      onConfirm={onDismiss}
      confirmLabel="Done"
    >
      <div className="flex flex-wrap content-center items-center justify-center gap-4 pt-6">
        {DIE_TYPES.map((sides) => {
          const entry = existingEntries.find((e) => e.sides === sides);
          return (
            <button
              key={sides}
              type="button"
              disabled={Boolean(entry)}
              onClick={() => onSelect(sides)}
              className={`relative flex h-[74px] w-[74px] flex-col items-center justify-center gap-1.5 rounded-2xl border bg-panel transition active:scale-95 disabled:cursor-not-allowed ${
                entry ? "border-accent-cyan/40" : "border-border"
              }`}
            >
              {entry && entry.count > 0 && (
                <span className="cta-gradient absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-[#0a0b14] shadow">
                  {entry.count}
                </span>
              )}
              <DieSprite sides={sides} value={1} className="h-8 w-8" />
              <span
                className={`font-mono text-[10px] tracking-[0.1em] ${entry ? "text-accent-cyan" : "text-muted"}`}
              >
                D{sides}
              </span>
            </button>
          );
        })}
      </div>
    </DialogShell>
  );
}

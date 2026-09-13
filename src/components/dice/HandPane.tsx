import { useState } from "react";
import { DIE_TYPES, activeDiceCount, type DieSides, type HandEntry } from "@/lib/hand";
import { DialogShell, type DialogBottomNav } from "@/components/ui/DialogShell";
import { HandRow } from "./HandRow";
import { AddDieGrid } from "./AddDieGrid";

type HandPaneProps = {
  hand: HandEntry[];
  color?: string;
  bottomNav: DialogBottomNav;
  onToggleEnabled: (sides: DieSides) => void;
  onIncrement: (sides: DieSides) => void;
  onDecrement: (sides: DieSides) => void;
  onAddDieType: (sides: DieSides) => void;
};

/**
 * Full-screen hand editor — covers the drop area while open. The add-die
 * grid is rendered inline in the SAME DialogShell instance (just swapping
 * title/content/confirm) rather than via a separately-mounted dialog, so
 * switching between the list and the grid doesn't remount the shell and
 * re-trigger its slide animation.
 */
export function HandPane({
  hand,
  color,
  bottomNav,
  onToggleEnabled,
  onIncrement,
  onDecrement,
  onAddDieType,
}: HandPaneProps) {
  const [addDieOpen, setAddDieOpen] = useState(false);
  const allTypesAdded = hand.length >= DIE_TYPES.length;

  if (addDieOpen) {
    return (
      <DialogShell
        title="Add die"
        bottomNav={bottomNav}
        instant
        onDismiss={() => setAddDieOpen(false)}
        onConfirm={() => setAddDieOpen(false)}
        confirmLabel="Done"
      >
        <AddDieGrid
          existingEntries={hand}
          onSelect={(sides) => {
            onAddDieType(sides);
            setAddDieOpen(false);
          }}
        />
      </DialogShell>
    );
  }

  return (
    <DialogShell
      title="Your hand"
      bottomNav={bottomNav}
      onDismiss={bottomNav.onHand}
      onConfirm={bottomNav.onHand}
      confirmDisabled={activeDiceCount(hand) === 0}
      addAction={allTypesAdded ? undefined : { label: "Add die", onClick: () => setAddDieOpen(true) }}
    >
      <div className="flex flex-col gap-1">
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
    </DialogShell>
  );
}

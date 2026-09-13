import { useState } from "react";
import { DIE_TYPES, activeDiceCount, type DieSides, type HandEntry } from "@/lib/hand";
import { DialogShell, type DialogBottomNav } from "@/components/ui/DialogShell";
import { HandRow } from "./HandRow";
import { AddDiePopup } from "./AddDiePopup";

type HandPaneProps = {
  hand: HandEntry[];
  color?: string;
  bottomNav: DialogBottomNav;
  onToggleEnabled: (sides: DieSides) => void;
  onIncrement: (sides: DieSides) => void;
  onDecrement: (sides: DieSides) => void;
  onAddDieType: (sides: DieSides) => void;
};

/** Full-screen hand editor — covers the drop area while open. */
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
      <AddDiePopup
        existingEntries={hand}
        bottomNav={bottomNav}
        onSelect={(sides) => {
          onAddDieType(sides);
          setAddDieOpen(false);
        }}
        onDismiss={() => setAddDieOpen(false)}
      />
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

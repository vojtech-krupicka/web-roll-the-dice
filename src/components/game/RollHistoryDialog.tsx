"use client";

import { setRollValidityAction } from "@/app/actions";
import type { PlayerSummary } from "@/lib/players";
import type { RollSummary } from "@/lib/rolls";
import { DialogShell, type DialogBottomNav } from "@/components/ui/DialogShell";
import { RollHistoryRow } from "./RollHistoryRow";

type RollHistoryDialogProps = {
  rolls: RollSummary[];
  players: PlayerSummary[];
  bottomNav: DialogBottomNav;
  onRollsChange: (rolls: RollSummary[]) => void;
  onDismiss: () => void;
};

/** Full-screen roll history — sorted newest first, each row expandable. */
export function RollHistoryDialog({ rolls, players, bottomNav, onRollsChange, onDismiss }: RollHistoryDialogProps) {
  async function handleToggleValid(roll: RollSummary) {
    const nextValid = !roll.isValid;
    onRollsChange(rolls.map((r) => (r.id === roll.id ? { ...r, isValid: nextValid } : r)));
    await setRollValidityAction(roll.id, nextValid);
  }

  return (
    <DialogShell title="Roll history" bottomNav={bottomNav} onDismiss={onDismiss}>
      {rolls.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">No rolls yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rolls.map((roll) => (
            <RollHistoryRow
              key={roll.id}
              roll={roll}
              player={players.find((p) => p.id === roll.playerId)}
              onToggleValid={() => handleToggleValid(roll)}
            />
          ))}
        </div>
      )}
    </DialogShell>
  );
}

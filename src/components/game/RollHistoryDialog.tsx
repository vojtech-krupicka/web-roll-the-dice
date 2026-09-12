"use client";

import { X } from "lucide-react";
import { setRollValidityAction } from "@/app/actions";
import type { PlayerSummary } from "@/lib/players";
import type { RollSummary } from "@/lib/rolls";
import { RollHistoryRow } from "./RollHistoryRow";

type RollHistoryDialogProps = {
  rolls: RollSummary[];
  players: PlayerSummary[];
  onRollsChange: (rolls: RollSummary[]) => void;
  onDismiss: () => void;
};

/** Full-screen roll history — sorted newest first, each row expandable. */
export function RollHistoryDialog({ rolls, players, onRollsChange, onDismiss }: RollHistoryDialogProps) {
  async function handleToggleValid(roll: RollSummary) {
    const nextValid = !roll.isValid;
    onRollsChange(rolls.map((r) => (r.id === roll.id ? { ...r, isValid: nextValid } : r)));
    await setRollValidityAction(roll.id, nextValid);
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-background px-6 py-4">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          Roll history
        </h2>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="rounded-full p-1 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <X size={20} />
        </button>
      </div>

      {rolls.length === 0 ? (
        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">No rolls yet.</p>
      ) : (
        <div className="mt-4 flex flex-col">
          {rolls.map((roll, index) => (
            <RollHistoryRow
              key={roll.id}
              roll={roll}
              player={players.find((p) => p.id === roll.playerId)}
              striped={index % 2 === 1}
              onToggleValid={() => handleToggleValid(roll)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

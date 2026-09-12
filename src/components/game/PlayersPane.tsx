"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { addPlayerAction, reorderPlayersAction, setCurrentPlayerAction, updatePlayerAction } from "@/app/actions";
import type { PlayerSummary } from "@/lib/players";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PlayerRow } from "./PlayerRow";
import { PlayerFormPane, type PlayerFormValues } from "./PlayerFormPane";

type PlayersPaneProps = {
  hash: string;
  players: PlayerSummary[];
  currentPlayerId: number;
  onPlayersChange: (players: PlayerSummary[]) => void;
  onSwitchPlayer: (playerId: number) => void;
  onDismiss: () => void;
};

type FormState = { mode: "add" } | { mode: "edit"; player: PlayerSummary } | null;

/** Full-screen player list: reorder (drag), enable, edit, and switch the current player. */
export function PlayersPane({
  hash,
  players,
  currentPlayerId,
  onPlayersChange,
  onSwitchPlayer,
  onDismiss,
}: PlayersPaneProps) {
  const [form, setForm] = useState<FormState>(null);
  const [switchTarget, setSwitchTarget] = useState<PlayerSummary | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = players.findIndex((p) => p.id === active.id);
    const newIndex = players.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(players, oldIndex, newIndex);
    onPlayersChange(reordered);
    await reorderPlayersAction(reordered.map((p) => p.id));
  }

  async function handleToggleEnabled(player: PlayerSummary) {
    const next = { ...player, enabled: !player.enabled };
    onPlayersChange(players.map((p) => (p.id === player.id ? next : p)));
    await updatePlayerAction(player.id, {
      name: next.name,
      color: next.color,
      icon: next.icon,
      enabled: next.enabled,
    });
  }

  async function handleFormSubmit(values: PlayerFormValues) {
    if (form?.mode === "edit") {
      const result = await updatePlayerAction(form.player.id, values);
      if (result.ok) {
        onPlayersChange(players.map((p) => (p.id === form.player.id ? { ...p, ...values } : p)));
      }
    } else {
      const result = await addPlayerAction(hash, values);
      if (result.ok) {
        onPlayersChange([...players, result.data.player]);
      }
    }
    setForm(null);
  }

  async function handleConfirmSwitch() {
    if (!switchTarget) return;
    await setCurrentPlayerAction(hash, switchTarget.id);
    onSwitchPlayer(switchTarget.id);
    setSwitchTarget(null);
    onDismiss();
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          Players
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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={players.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-4 flex flex-col gap-1">
            {players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                isCurrent={player.id === currentPlayerId}
                onToggleEnabled={() => handleToggleEnabled(player)}
                onEdit={() => setForm({ mode: "edit", player })}
                onSelect={() => setSwitchTarget(player)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => setForm({ mode: "add" })}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
      >
        <Plus size={18} aria-hidden="true" />
        Add player
      </button>

      {form && (
        <PlayerFormPane
          mode={form.mode}
          initial={form.mode === "edit" ? form.player : undefined}
          defaultName={`Player #${players.length + 1}`}
          usedColors={players
            .filter((p) => !(form.mode === "edit" && p.id === form.player.id))
            .map((p) => p.color)}
          onSubmit={handleFormSubmit}
          onDismiss={() => setForm(null)}
        />
      )}

      {switchTarget && (
        <ConfirmDialog
          title="Switch player?"
          message={`Make ${switchTarget.name} the current player?`}
          confirmLabel="Switch"
          onConfirm={handleConfirmSwitch}
          onCancel={() => setSwitchTarget(null)}
        />
      )}
    </div>
  );
}

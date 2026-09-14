"use client";

import { useState } from "react";
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
import { PLAYER_ICONS, pickRandomAvailableColor } from "@/lib/playerColors";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DialogShell, type DialogBottomNav } from "@/components/ui/DialogShell";
import { PlayerRow } from "./PlayerRow";
import { PlayerFormFields } from "./PlayerFormFields";

type PlayersPaneProps = {
  hash: string;
  players: PlayerSummary[];
  currentPlayerId: number;
  bottomNav: DialogBottomNav;
  onPlayersChange: (players: PlayerSummary[]) => void;
  onSwitchPlayer: (playerId: number) => void;
  onDismiss: () => void;
};

type FormState = { mode: "add" } | { mode: "edit"; player: PlayerSummary } | null;

/**
 * Full-screen player list: reorder (drag), enable, edit, and switch the
 * current player. The add/edit form is rendered inline in the SAME
 * DialogShell instance (just swapping title/content/confirm) rather than via
 * a separately-mounted dialog, so switching between the list and the form
 * doesn't remount the shell.
 */
export function PlayersPane({
  hash,
  players,
  currentPlayerId,
  bottomNav,
  onPlayersChange,
  onSwitchPlayer,
  onDismiss,
}: PlayersPaneProps) {
  const [form, setForm] = useState<FormState>(null);
  const [switchTarget, setSwitchTarget] = useState<PlayerSummary | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Add/edit form field state — only meaningful while `form` is set.
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState("");
  const [formIcon, setFormIcon] = useState<string>(PLAYER_ICONS[0]);
  const [formEnabled, setFormEnabled] = useState(true);
  const [formPending, setFormPending] = useState(false);

  function openForm(next: Exclude<FormState, null>) {
    if (next.mode === "edit") {
      setFormName(next.player.name);
      setFormColor(next.player.color);
      setFormIcon(next.player.icon);
      setFormEnabled(next.player.enabled);
    } else {
      setFormName(`Player #${players.length + 1}`);
      setFormColor(pickRandomAvailableColor(players.map((p) => p.color)));
      setFormIcon(PLAYER_ICONS[0]);
      setFormEnabled(true);
    }
    setForm(next);
  }

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

  async function handleFormSubmit() {
    if (!formName.trim()) return;
    setFormPending(true);
    const values = { name: formName.trim(), color: formColor, icon: formIcon, enabled: formEnabled };

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

    setFormPending(false);
    setForm(null);
  }

  async function handleConfirmSwitch() {
    if (!switchTarget) return;
    await setCurrentPlayerAction(hash, switchTarget.id);
    onSwitchPlayer(switchTarget.id);
    setSwitchTarget(null);
    onDismiss();
  }

  if (form) {
    const usedColors = players
      .filter((p) => !(form.mode === "edit" && p.id === form.player.id))
      .map((p) => p.color);

    return (
      <DialogShell
        title={form.mode === "add" ? "Add player" : "Edit player"}
        bottomNav={bottomNav}
        onDismiss={() => setForm(null)}
        onConfirm={handleFormSubmit}
        confirmDisabled={formPending || !formName.trim()}
      >
        <PlayerFormFields
          name={formName}
          onNameChange={setFormName}
          color={formColor}
          onColorChange={setFormColor}
          icon={formIcon}
          onIconChange={setFormIcon}
          enabled={formEnabled}
          onEnabledChange={setFormEnabled}
          usedColors={usedColors}
        />
      </DialogShell>
    );
  }

  return (
    <DialogShell
      title="Players"
      bottomNav={bottomNav}
      onDismiss={onDismiss}
      addAction={{ label: "Add player", onClick: () => openForm({ mode: "add" }) }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={players.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                isCurrent={player.id === currentPlayerId}
                onToggleEnabled={() => handleToggleEnabled(player)}
                onEdit={() => openForm({ mode: "edit", player })}
                onSelect={() => setSwitchTarget(player)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {switchTarget && (
        <ConfirmDialog
          title="Switch player?"
          message={`Make ${switchTarget.name} the current player?`}
          confirmLabel="Switch"
          onConfirm={handleConfirmSwitch}
          onCancel={() => setSwitchTarget(null)}
        />
      )}
    </DialogShell>
  );
}

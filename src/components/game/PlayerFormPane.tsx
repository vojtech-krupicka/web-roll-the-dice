"use client";

import { useState } from "react";
import { PLAYER_ICONS, pickRandomAvailableColor } from "@/lib/playerColors";
import { DialogShell, type DialogBottomNav } from "@/components/ui/DialogShell";
import { PlayerFormFields } from "./PlayerFormFields";

export type PlayerFormValues = {
  name: string;
  color: string;
  icon: string;
  enabled: boolean;
};

type PlayerFormPaneProps = {
  mode: "add" | "edit";
  initial?: PlayerFormValues;
  defaultName: string;
  /** Colors already in use by other players — disabled in the picker. */
  usedColors: string[];
  bottomNav: DialogBottomNav;
  onSubmit: (values: PlayerFormValues) => void | Promise<void>;
  onDismiss: () => void;
};

/**
 * Standalone add/edit player dialog — used when the form is opened directly
 * (e.g. the current-player badge), so a fresh slide-up/down is correct here.
 * The Players list opens the same fields inline within its own DialogShell
 * instead of this wrapper, so switching between the list and the form
 * doesn't remount the shell and double up the slide animation.
 */
export function PlayerFormPane({
  mode,
  initial,
  defaultName,
  usedColors,
  bottomNav,
  onSubmit,
  onDismiss,
}: PlayerFormPaneProps) {
  const [name, setName] = useState(initial?.name ?? defaultName);
  const [color, setColor] = useState(() => initial?.color ?? pickRandomAvailableColor(usedColors));
  const [icon, setIcon] = useState(initial?.icon ?? PLAYER_ICONS[0]);
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) return;
    setPending(true);
    await onSubmit({ name: name.trim(), color, icon, enabled });
    setPending(false);
  }

  return (
    <DialogShell
      title={mode === "add" ? "Add player" : "Edit player"}
      bottomNav={bottomNav}
      onDismiss={onDismiss}
      onConfirm={handleSubmit}
      confirmDisabled={pending || !name.trim()}
    >
      <PlayerFormFields
        name={name}
        onNameChange={setName}
        color={color}
        onColorChange={setColor}
        icon={icon}
        onIconChange={setIcon}
        enabled={enabled}
        onEnabledChange={setEnabled}
        usedColors={usedColors}
      />
    </DialogShell>
  );
}

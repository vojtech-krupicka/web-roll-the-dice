"use client";

import { useState } from "react";
import { PLAYER_COLORS, PLAYER_ICONS, pickRandomAvailableColor } from "@/lib/playerColors";
import { DialogShell, type DialogBottomNav } from "@/components/ui/DialogShell";
import { Switch } from "@/components/ui/Switch";

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

/** Add/edit form for a player: name, color, icon, enabled. */
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
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-faint">NAME</p>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Player name"
            className="w-full rounded-xl border border-border-strong bg-panel px-4 py-3 text-[15px] font-bold outline-none focus:border-accent-cyan/60"
            style={{ color }}
          />
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-faint">COLOR</p>
          <div className="flex flex-wrap gap-3">
            {PLAYER_COLORS.map((c) => {
              const taken = usedColors.includes(c) && c !== color;
              const selected = color === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  disabled={taken}
                  title={taken ? "Already used by another player" : undefined}
                  aria-label={c}
                  aria-pressed={selected}
                  className="h-9 w-9 rounded-full transition disabled:cursor-not-allowed disabled:opacity-25"
                  style={{
                    backgroundColor: c,
                    boxShadow: selected ? `0 0 0 3px var(--color-panel-inset), 0 0 0 5px ${c}, 0 0 12px ${c}b3` : undefined,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-faint">ICON</p>
          <div className="flex gap-3">
            {PLAYER_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                aria-pressed={icon === i}
                className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl border-[1.5px] bg-panel text-2xl transition ${
                  icon === i ? "border-accent-cyan/50 shadow-[0_0_12px_rgba(34,211,238,0.3)]" : "border-border"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[#cbd5e1]">Active in rotation</span>
          <Switch checked={enabled} onChange={setEnabled} aria-label="Active in rotation" />
        </div>
      </div>
    </DialogShell>
  );
}

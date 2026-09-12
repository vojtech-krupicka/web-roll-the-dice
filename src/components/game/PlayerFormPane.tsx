"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PLAYER_COLORS, PLAYER_ICONS, pickRandomAvailableColor } from "@/lib/playerColors";

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
  onSubmit: (values: PlayerFormValues) => void | Promise<void>;
  onDismiss: () => void;
};

/** Add/edit form for a player: name, color, icon, enabled. */
export function PlayerFormPane({
  mode,
  initial,
  defaultName,
  usedColors,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-background p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            {mode === "add" ? "Add player" : "Edit player"}
          </h3>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="rounded-full p-1 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Player name"
            className="rounded-xl border border-neutral-300 bg-transparent px-4 py-3 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:focus:border-neutral-400"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">Color</p>
            <div className="flex flex-wrap gap-2">
              {PLAYER_COLORS.map((c) => {
                const taken = usedColors.includes(c) && c !== color;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    disabled={taken}
                    title={taken ? "Already used by another player" : undefined}
                    aria-label={c}
                    aria-pressed={color === c}
                    className={`h-9 w-9 rounded-full transition disabled:cursor-not-allowed disabled:opacity-25 ${
                      color === c
                        ? "ring-2 ring-neutral-900 ring-offset-2 ring-offset-white dark:ring-neutral-100 dark:ring-offset-neutral-950"
                        : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">Icon</p>
            <div className="flex gap-2">
              {PLAYER_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  aria-pressed={icon === i}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition ${
                    icon === i
                      ? "border-neutral-900 dark:border-neutral-100"
                      : "border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              className="h-5 w-5 accent-neutral-900 dark:accent-neutral-100"
            />
            Enabled
          </label>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending || !name.trim()}
          className="mt-5 w-full rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {mode === "add" ? "Add player" : "Save"}
        </button>
      </div>
    </div>
  );
}

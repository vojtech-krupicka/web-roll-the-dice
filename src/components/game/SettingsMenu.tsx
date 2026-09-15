"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, Box, HelpCircle, Info, Volume2, VolumeX } from "lucide-react";
import { LegendPopup } from "./LegendPopup";
import { HelpPopup } from "./HelpPopup";
import { AboutPopup } from "./AboutPopup";
import { Switch } from "@/components/ui/Switch";
import { isMuted, setMuted } from "@/lib/sound";
import { updateGameModeAction } from "@/app/actions";
import type { GameSettings } from "@/lib/db/schema";

type RollMode = NonNullable<GameSettings["mode"]>;

type SettingsMenuProps = {
  hash: string;
  mode: RollMode;
  onModeChange: (mode: RollMode) => void;
  /** Blocks changing the roll mode mid-roll — switching out from under an in-flight roll can't be cancelled cleanly. */
  modeChangeDisabled?: boolean;
  onDismiss: () => void;
};

type View = "menu" | "legend" | "help" | "about";

/** Top-bar Settings popup: Legend / About. Leave lives directly in the top bar now. */
export function SettingsMenu({
  hash,
  mode,
  onModeChange,
  modeChangeDisabled,
  onDismiss,
}: SettingsMenuProps) {
  const [view, setView] = useState<View>("menu");
  const [muted, setMutedState] = useState(() => isMuted());

  if (view === "legend") return <LegendPopup onDismiss={() => setView("menu")} />;
  if (view === "help") return <HelpPopup onDismiss={() => setView("menu")} />;
  if (view === "about") return <AboutPopup onDismiss={() => setView("menu")} />;

  function handleModeChange(checked: boolean) {
    const next: RollMode = checked ? "3d" : "2d";
    onModeChange(next);
    void updateGameModeAction(hash, next);
  }

  return (
    <>
      {/* Invisible full-screen layer just to catch outside clicks — no dimming, this is a menu, not a dialog. */}
      <div className="fixed inset-0 z-30" onClick={onDismiss} />
      <div
        className="absolute top-full right-0 z-40 mt-2 w-56 rounded-2xl border border-border bg-panel p-2 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full items-center gap-3 rounded-xl px-4 py-3">
          <Box size={18} className={mode === "3d" ? undefined : "text-muted"} />
          <span className="flex flex-1 items-center gap-1.5 text-left text-sm font-semibold">
            3D dice
            <span className="rounded-full border border-accent-cyan/40 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-accent-cyan">
              BETA
            </span>
          </span>
          <Switch
            checked={mode === "3d"}
            onChange={handleModeChange}
            disabled={modeChangeDisabled}
            aria-label="Toggle 3D roll mode"
          />
        </div>
        <div className="flex w-full items-center gap-3 rounded-xl px-4 py-3">
          {muted ? <VolumeX size={18} className="text-muted" /> : <Volume2 size={18} />}
          <span className="flex-1 text-left text-sm font-semibold">Sound</span>
          <Switch
            checked={!muted}
            onChange={(checked) => {
              setMuted(!checked);
              setMutedState(!checked);
            }}
            aria-label="Toggle sound"
          />
        </div>
        <div className="my-1 border-t border-border" />
        <MenuItem icon={<BookOpen size={18} />} label="Legend" onClick={() => setView("legend")} />
        <MenuItem icon={<HelpCircle size={18} />} label="Help" onClick={() => setView("help")} />
        <MenuItem icon={<Info size={18} />} label="About" onClick={() => setView("about")} />
      </div>
    </>
  );
}

function MenuItem({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition hover:bg-white/5"
    >
      {icon}
      {label}
    </button>
  );
}

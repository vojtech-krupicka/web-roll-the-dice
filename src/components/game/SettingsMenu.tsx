"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, Info } from "lucide-react";
import { LegendPopup } from "./LegendPopup";
import { AboutPopup } from "./AboutPopup";

type SettingsMenuProps = {
  hash: string;
  onDismiss: () => void;
};

type View = "menu" | "legend" | "about";

/** Top-bar Settings popup: Legend / About. Leave lives directly in the top bar now. */
export function SettingsMenu({ onDismiss }: SettingsMenuProps) {
  const [view, setView] = useState<View>("menu");

  if (view === "legend") return <LegendPopup onDismiss={() => setView("menu")} />;
  if (view === "about") return <AboutPopup onDismiss={() => setView("menu")} />;

  return (
    <>
      {/* Invisible full-screen layer just to catch outside clicks — no dimming, this is a menu, not a dialog. */}
      <div className="fixed inset-0 z-30" onClick={onDismiss} />
      <div
        className="absolute top-full right-0 z-40 mt-2 w-56 rounded-2xl border border-border bg-panel p-2 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <MenuItem icon={<BookOpen size={18} />} label="Legend" onClick={() => setView("legend")} />
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

"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Info, LogOut } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { leaveGameAction } from "@/app/actions";
import { LegendPopup } from "./LegendPopup";
import { AboutPopup } from "./AboutPopup";

type SettingsMenuProps = {
  hash: string;
  onDismiss: () => void;
};

type View = "menu" | "leave-confirm" | "legend" | "about";

/** Top-bar Settings popup: Leave game / Legend / About. */
export function SettingsMenu({ hash, onDismiss }: SettingsMenuProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("menu");

  async function handleLeaveConfirmed() {
    await leaveGameAction(hash);
    router.push("/");
  }

  if (view === "legend") return <LegendPopup onDismiss={() => setView("menu")} />;
  if (view === "about") return <AboutPopup onDismiss={() => setView("menu")} />;

  if (view === "leave-confirm") {
    return (
      <ConfirmDialog
        title="Leave game?"
        message="You can rejoin later with the game hash."
        confirmLabel="Leave"
        danger
        onConfirm={handleLeaveConfirmed}
        onCancel={() => setView("menu")}
      />
    );
  }

  return (
    <>
      {/* Invisible full-screen layer just to catch outside clicks — no dimming, this is a menu, not a dialog. */}
      <div className="fixed inset-0 z-30" onClick={onDismiss} />
      <div
        className="absolute top-full left-0 z-40 mt-2 w-56 rounded-2xl border border-neutral-200 bg-background p-2 shadow-2xl dark:border-neutral-800"
        onClick={(event) => event.stopPropagation()}
      >
        <MenuItem icon={<LogOut size={18} />} label="Leave game" onClick={() => setView("leave-confirm")} />
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
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
    >
      {icon}
      {label}
    </button>
  );
}

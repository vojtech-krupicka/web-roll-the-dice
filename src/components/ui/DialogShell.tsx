"use client";

import type { ReactNode } from "react";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { BottomBar } from "@/components/layout/BottomBar";

export type DialogBottomNav = {
  active: "players" | "hand" | null;
  onPlayers: () => void;
  onHand: () => void;
};

export type DialogShellProps = {
  title: string;
  onDismiss: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  bottomNav: DialogBottomNav;
  addAction?: { label: string; onClick: () => void };
  children: ReactNode;
};

/**
 * Full-screen dialog chrome shared by every game dialog — the same top/bottom
 * bar as the main screen, so switching between the main screen and a dialog
 * feels like one continuous surface rather than a modal popping up.
 */
export function DialogShell({
  title,
  onDismiss,
  onConfirm,
  confirmLabel = "OK",
  confirmDisabled,
  bottomNav,
  addAction,
  children,
}: DialogShellProps) {
  return (
    <div className="app-gradient-bg fixed inset-0 z-40 flex flex-col">
      <TopBar
        left={
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Back"
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] border border-border bg-white/[0.06] text-[#cbd5e1] transition hover:bg-white/10"
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        }
        center={<span className="truncate text-sm font-bold">{title}</span>}
      />

      <div className="relative mx-4 mt-[18px] flex-1">
        <div className="absolute inset-0 overflow-hidden rounded-[20px] border border-border bg-panel-inset">
          <div className="h-full overflow-y-auto px-4 pt-4 pb-[160px]">{children}</div>
        </div>

        {addAction && (
          <button
            type="button"
            onClick={addAction.onClick}
            aria-label={addAction.label}
            className="absolute right-5 bottom-[170px] z-[3] cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:scale-95"
          >
            <div className="mr-5 flex h-8 items-center rounded-full border-[1.5px] border-border bg-panel py-0 pr-[30px] pl-4 shadow-lg transition-colors hover:bg-panel-hover">
              <span className="text-[13px] font-bold tracking-wide whitespace-nowrap text-[#cbd5e1]">
                {addAction.label}
              </span>
            </div>
            <div className="cta-gradient absolute top-1/2 right-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_0_14px_rgba(139,92,246,0.55)]">
              <Plus size={18} strokeWidth={2.6} className="text-[#0a0b14]" aria-hidden="true" />
            </div>
          </button>
        )}

        <BottomBar active={bottomNav.active} onPlayers={bottomNav.onPlayers} onHand={bottomNav.onHand} />

        <button
          type="button"
          onClick={onConfirm ?? onDismiss}
          disabled={confirmDisabled}
          className="cta-gradient absolute bottom-[-38px] left-1/2 z-[4] flex h-[168px] w-[168px] -translate-x-1/2 cursor-pointer flex-col items-center justify-center gap-1 rounded-full shadow-[0_0_0_6px_var(--bg-stop-2),0_0_34px_rgba(139,92,246,0.55)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_0_6px_var(--bg-stop-2),0_0_46px_rgba(139,92,246,0.8)] active:scale-95 disabled:cursor-not-allowed disabled:grayscale disabled:shadow-[0_0_0_6px_var(--bg-stop-2)] disabled:hover:scale-100"
        >
          <Check size={30} strokeWidth={3} className="text-[#0a0b14]" aria-hidden="true" />
          <span className="text-[28px] font-bold text-[#0a0b14]">{confirmLabel}</span>
        </button>
      </div>
    </div>
  );
}

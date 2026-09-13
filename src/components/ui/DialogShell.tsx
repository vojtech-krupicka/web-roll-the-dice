"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { BottomBar } from "@/components/layout/BottomBar";

const TRANSITION_MS = 260;

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
  /**
   * Set when this shell instance is shared across sibling sub-views (e.g. a
   * player list and its add/edit form, or a hand and its add-die grid) and
   * `onDismiss`/`onConfirm` just switch back to a sibling rather than truly
   * closing the dialog. Skips the slide-down exit for those two actions so
   * the shell stays put and only its content swaps — bottom-nav navigation
   * (which does leave the dialog family) still always animates.
   */
  instant?: boolean;
  bottomNav: DialogBottomNav;
  addAction?: { label: string; onClick: () => void };
  children: ReactNode;
};

/**
 * Full-screen dialog chrome shared by every game dialog — the same top/bottom
 * bar as the main screen, so switching between the main screen and a dialog
 * feels like one continuous surface rather than a modal popping up. The
 * chrome itself (top bar, bottom bar, add-action pill, confirm FAB) appears
 * immediately in its final position — it's the same bars the main screen
 * already shows, so animating them too would look like a second bottom bar
 * sliding up past the real one. Only the content panel slides up from the
 * bottom edge on mount and slides back down before any of its exit actions
 * (back, confirm, bottom-nav) actually take effect.
 */
export function DialogShell({
  title,
  onDismiss,
  onConfirm,
  confirmLabel = "OK",
  confirmDisabled,
  instant,
  bottomNav,
  addAction,
  children,
}: DialogShellProps) {
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // A short timeout (rather than requestAnimationFrame) so the browser
    // paints the initial off-screen position at least once before the
    // transition to translate-y-0 starts — rAF can be suspended entirely on
    // a backgrounded/inactive tab, silently skipping the animation.
    const id = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(id);
  }, []);

  function exit(after: () => void) {
    setClosing(true);
    setTimeout(after, TRANSITION_MS);
  }

  const handleDismiss = instant ? onDismiss : () => exit(onDismiss);
  const handleConfirm = instant ? (onConfirm ?? onDismiss) : () => exit(onConfirm ?? onDismiss);
  const handleBottomNavPlayers = () => exit(bottomNav.onPlayers);
  const handleBottomNavHand = () => exit(bottomNav.onHand);

  return (
    <div className="app-gradient-bg fixed inset-0 z-40 flex flex-col">
      <TopBar
        left={
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Back"
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] border border-border bg-white/[0.06] text-[#cbd5e1] transition hover:bg-white/10"
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        }
        center={<span className="truncate text-sm font-bold">{title}</span>}
      />

      <div className="relative mx-4 mt-[18px] flex-1">
        <div
          className={`absolute inset-0 overflow-hidden rounded-[20px] border border-border bg-panel-inset transition-transform duration-[260ms] ease-out ${
            entered && !closing ? "translate-y-0" : "translate-y-full"
          }`}
        >
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

        <BottomBar active={bottomNav.active} onPlayers={handleBottomNavPlayers} onHand={handleBottomNavHand} />

        <button
          type="button"
          onClick={handleConfirm}
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

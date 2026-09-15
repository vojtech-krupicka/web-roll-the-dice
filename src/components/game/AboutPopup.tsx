import { X } from "lucide-react";
import { APP_VERSION } from "@/lib/version";

type AboutPopupProps = {
  onDismiss: () => void;
};

/** Short "about this app" info modal. */
export function AboutPopup({ onDismiss }: AboutPopupProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-panel p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[10px] font-bold tracking-[0.1em] text-faint uppercase">About</h3>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="rounded-full p-1 text-muted transition hover:bg-white/5"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-muted">
          Roll the Dice is a simple, mobile-friendly dice roller for D&amp;D and tabletop sessions.
          Build a hand of any mix of dice and roll them all at once.
        </p>

        <p className="mt-3 font-mono text-xs tracking-wide text-faint">{APP_VERSION}</p>

        <div className="mt-4 flex flex-col gap-2">
          <a
            href="https://github.com/vojtech-krupicka/web-roll-the-dice"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-accent-cyan underline underline-offset-4"
          >
            View source on GitHub
          </a>
          <a
            href="https://github.com/vojtech-krupicka/web-roll-the-dice/releases"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-accent-cyan underline underline-offset-4"
          >
            What&apos;s new
          </a>
        </div>
      </div>
    </div>
  );
}

import { X } from "lucide-react";

type AboutPopupProps = {
  onDismiss: () => void;
};

/** Short "about this app" info modal. */
export function AboutPopup({ onDismiss }: AboutPopupProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-background p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            About
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

        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Roll the Dice is a simple, mobile-friendly dice roller for D&amp;D and tabletop sessions.
          Build a hand of any mix of dice and roll them all at once.
        </p>

        <a
          href="https://github.com/vojtech-krupicka/web-roll-the-dice"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm font-medium text-neutral-900 underline underline-offset-4 dark:text-neutral-100"
        >
          View source on GitHub
        </a>
      </div>
    </div>
  );
}

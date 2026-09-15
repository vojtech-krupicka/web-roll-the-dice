import { X } from "lucide-react";
import { createPortal } from "react-dom";

type HelpPopupProps = {
  onDismiss: () => void;
};

type Section = { title: string; body: string[] };

const SECTIONS: Section[] = [
  {
    title: "Games",
    body: [
      "Join an existing game with its 5-character code, or create a new one from the home screen.",
      "A game can be password-protected — the game code plus password gets anyone back in later.",
    ],
  },
  {
    title: "Your hand",
    body: [
      "Open Hand to build the set of dice you roll each time — mix any die types (a coin through a d100) in any counts.",
      "Turning a die type off keeps its count for later; removing it for good means setting its count to zero.",
    ],
  },
  {
    title: "Rolling",
    body: [
      "Tap Roll! to roll your whole hand at once. The result banner shows every die plus the total, average, median, min, and max.",
      "The pill above Roll! shows the last roll — tap it for the full history, where a roll can be marked invalid (without deleting it) if it shouldn't count.",
    ],
  },
  {
    title: "Players",
    body: [
      "Open Players to add more — each gets their own color, hand, and roll history.",
      "Next moves to the next player in turn order; picking a player directly from the list works too.",
    ],
  },
  {
    title: "3D dice",
    body: [
      "Turn on 3D dice in this menu for a real physics roll instead of flat sprites — still BETA, so expect some rough edges.",
      "Coins don't have a 3D model, so they always flip flat even in 3D mode.",
    ],
  },
];

/** Short how-to-use reference, covering the app's main flows section by section. */
export function HelpPopup({ onDismiss }: HelpPopupProps) {
  // Portaled to <body> — this can be opened from inside TopBar (a positioned,
  // z-indexed stacking context), which would otherwise trap this fixed
  // overlay below anything elsewhere on the page that also sets a z-index
  // (the roll-history/next-player pills), no matter how high this z-index is.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onDismiss}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-sm flex-col rounded-2xl border border-border bg-panel p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h3 className="text-[10px] font-bold tracking-[0.1em] text-faint uppercase">Help</h3>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="rounded-full p-1 text-muted transition hover:bg-white/5"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="mb-1.5 text-sm font-bold text-accent-cyan">{section.title}</h4>
              <div className="flex flex-col gap-1.5">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

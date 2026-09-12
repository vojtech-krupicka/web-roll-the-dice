import { CopyButton } from "@/components/ui/CopyButton";

type GameHashDialogProps = {
  hash: string;
  onDismiss: () => void;
};

/** Shown once after joining/creating a game — the hash to save/share. */
export function GameHashDialog({ hash, onDismiss }: GameHashDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-background p-6 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Your game hash</p>

        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-3xl font-bold tracking-[0.3em] uppercase">{hash}</span>
          <CopyButton value={hash} />
        </div>

        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          Save this hash — you&apos;ll need it to rejoin the game later.
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 w-full rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white transition active:scale-95 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

import { CopyButton } from "@/components/ui/CopyButton";
import { DialogShell, type DialogBottomNav } from "@/components/ui/DialogShell";

type GameHashDialogProps = {
  hash: string;
  bottomNav: DialogBottomNav;
  onDismiss: () => void;
};

/** Shown once after joining/creating a game — the hash to save/share. */
export function GameHashDialog({ hash, bottomNav, onDismiss }: GameHashDialogProps) {
  return (
    <DialogShell title="Your game hash" bottomNav={bottomNav} onDismiss={onDismiss} confirmLabel="Got it">
      <div className="flex flex-col items-center pt-10 text-center">
        <p className="text-sm font-semibold text-muted">Your game hash</p>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="font-mono text-3xl font-bold tracking-[0.25em] text-[#67e8f9] uppercase">{hash}</span>
          <CopyButton value={hash} />
        </div>

        <p className="mt-4 max-w-[240px] text-sm text-muted">
          Save this hash — you&apos;ll need it to rejoin the game later.
        </p>
      </div>
    </DialogShell>
  );
}

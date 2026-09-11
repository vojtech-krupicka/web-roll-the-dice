import { Settings } from "lucide-react";

type SettingsButtonProps = {
  onClick: () => void;
};

/** Top-bar cog button that opens the Settings menu. */
export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Settings"
      className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
    >
      <Settings size={20} aria-hidden="true" />
    </button>
  );
}

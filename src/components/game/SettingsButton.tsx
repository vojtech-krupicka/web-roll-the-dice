import { Menu } from "lucide-react";

type SettingsButtonProps = {
  onClick: () => void;
};

/** Top-bar hamburger button that opens the Settings menu (Legend/About). */
export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Settings"
      className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-white/[0.06] text-[#cbd5e1] transition hover:bg-white/10"
    >
      <Menu size={15} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}

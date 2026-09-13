import { Dices } from "lucide-react";

type RollButtonProps = {
  disabled: boolean;
  onClick: () => void;
};

/** The floating circular Roll call-to-action, straddling the game area's bottom edge. */
export function RollButton({ disabled, onClick }: RollButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="cta-gradient absolute bottom-[-38px] left-1/2 z-[4] flex h-[168px] w-[168px] -translate-x-1/2 flex-col items-center justify-center gap-1 rounded-full shadow-[0_0_0_6px_var(--bg-stop-2),0_0_34px_rgba(139,92,246,0.55)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Dices size={30} strokeWidth={2.6} className="text-[#0a0b14]" aria-hidden="true" />
      <span className="text-[28px] font-bold text-[#0a0b14]">Roll!</span>
    </button>
  );
}

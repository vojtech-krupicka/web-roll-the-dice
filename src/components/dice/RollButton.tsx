import { Dices } from "lucide-react";

type RollButtonProps = {
  disabled: boolean;
  rolling: boolean;
  onClick: () => void;
};

/** The floating circular Roll call-to-action, straddling the game area's bottom edge. */
export function RollButton({ disabled, rolling, onClick }: RollButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`cta-gradient absolute bottom-[-38px] left-1/2 z-[4] flex h-[168px] w-[168px] -translate-x-1/2 cursor-pointer flex-col items-center justify-center gap-1 rounded-full transition-all duration-200 active:scale-95 disabled:cursor-not-allowed ${
        rolling
          ? "animate-pulse shadow-[0_0_0_6px_var(--bg-stop-2),0_0_44px_rgba(139,92,246,0.75)]"
          : disabled
            ? "shadow-[0_0_0_6px_var(--bg-stop-2)] grayscale"
            : "shadow-[0_0_0_6px_var(--bg-stop-2),0_0_34px_rgba(139,92,246,0.55)] hover:scale-[1.03] hover:shadow-[0_0_0_6px_var(--bg-stop-2),0_0_46px_rgba(139,92,246,0.8)]"
      }`}
    >
      <Dices
        size={30}
        strokeWidth={2.6}
        className={`text-[#0a0b14] ${rolling ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      <span className={`font-bold text-[#0a0b14] ${rolling ? "text-[22px]" : "text-[28px]"}`}>
        {rolling ? "Rolling" : "Roll!"}
      </span>
    </button>
  );
}

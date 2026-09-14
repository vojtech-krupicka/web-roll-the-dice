import { Check, Dices } from "lucide-react";

type RollButtonProps = {
  disabled: boolean;
  rolling: boolean;
  /** Result is showing — button becomes the OK action that dismisses it. */
  showResult: boolean;
  onClick: () => void;
};

/** The floating circular Roll call-to-action, straddling the game area's bottom edge. */
export function RollButton({ disabled, rolling, showResult, onClick }: RollButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-sound={showResult ? undefined : "roll"}
      className={`cta-gradient absolute bottom-[-38px] left-1/2 z-[7] flex h-[168px] w-[168px] -translate-x-1/2 cursor-pointer flex-col items-center justify-center gap-1 rounded-full transition-all duration-200 active:scale-95 disabled:cursor-not-allowed ${
        showResult
          ? "shadow-[0_0_0_6px_var(--bg-stop-2),0_0_46px_rgba(139,92,246,0.8)] hover:scale-[1.03]"
          : rolling
            ? "animate-pulse shadow-[0_0_0_6px_var(--bg-stop-2),0_0_44px_rgba(139,92,246,0.75)]"
            : disabled
              ? "shadow-[0_0_0_6px_var(--bg-stop-2)] grayscale"
              : "shadow-[0_0_0_6px_var(--bg-stop-2),0_0_34px_rgba(139,92,246,0.55)] hover:scale-[1.03] hover:shadow-[0_0_0_6px_var(--bg-stop-2),0_0_46px_rgba(139,92,246,0.8)]"
      }`}
    >
      {showResult ? (
        <>
          <Check size={30} strokeWidth={3} className="text-[#0a0b14]" aria-hidden="true" />
          <span className="text-[28px] font-bold text-[#0a0b14]">OK</span>
        </>
      ) : (
        <>
          <Dices
            size={30}
            strokeWidth={2.6}
            className={`text-[#0a0b14] ${rolling ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          <span className={`font-bold text-[#0a0b14] ${rolling ? "text-[22px]" : "text-[28px]"}`}>
            {rolling ? "Rolling" : "Roll!"}
          </span>
        </>
      )}
    </button>
  );
}

import { Dices } from "lucide-react";

type RollButtonProps = {
  disabled: boolean;
  onClick: () => void;
};

/** The big "Roll the dice" call-to-action button. */
export function RollButton({ disabled, onClick }: RollButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-neutral-900 px-8 py-5 text-lg font-semibold text-white shadow-lg transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
    >
      <Dices size={26} strokeWidth={2} aria-hidden="true" />
      Roll the dice
    </button>
  );
}

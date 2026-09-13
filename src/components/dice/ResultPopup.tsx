type ResultPopupProps = {
  value: number;
  onDismiss: () => void;
};

/**
 * Full-screen dismiss layer showing the rolled value in a small bubble
 * in front of the Roll button. Clicking anywhere dismisses it.
 */
export function ResultPopup({ value, onDismiss }: ResultPopupProps) {
  return (
    <button
      type="button"
      aria-label="Dismiss result and roll again"
      onClick={onDismiss}
      className="fixed inset-0 z-20 flex cursor-pointer items-end justify-center bg-black/50 pb-[190px] backdrop-blur-[2px]"
    >
      <span className="cta-gradient rounded-2xl px-10 py-5 text-4xl font-bold tabular-nums text-[#0a0b14] shadow-2xl">
        {value}
      </span>
    </button>
  );
}

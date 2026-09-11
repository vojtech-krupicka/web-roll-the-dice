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
      className="fixed inset-0 z-20 flex cursor-pointer items-end justify-center bg-black/10 pb-36 backdrop-blur-[1px] dark:bg-black/30"
    >
      <span className="rounded-2xl bg-neutral-900 px-10 py-5 text-4xl font-bold tabular-nums text-white shadow-2xl dark:bg-neutral-100 dark:text-neutral-900">
        {value}
      </span>
    </button>
  );
}

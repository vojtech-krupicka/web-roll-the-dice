"use client";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Hex color for the "on" state — defaults to the app's cyan accent. Pass a player's color to tint it. */
  activeColor?: string;
  "aria-label"?: string;
};

/** A toggle switch, tintable per-player via `activeColor`. */
export function Switch({ checked, onChange, activeColor = "#22d3ee", "aria-label": ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-10 shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: checked ? `${activeColor}4d` : "rgba(148,163,184,0.15)" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full transition-all"
        style={{
          left: checked ? "calc(100% - 22px)" : "2px",
          backgroundColor: checked ? activeColor : "#6b7280",
          boxShadow: checked ? `0 0 6px ${activeColor}` : "none",
        }}
      />
    </button>
  );
}

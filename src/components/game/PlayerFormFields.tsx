import { PLAYER_COLORS, PLAYER_ICONS } from "@/lib/playerColors";
import { Switch } from "@/components/ui/Switch";

type PlayerFormFieldsProps = {
  name: string;
  onNameChange: (name: string) => void;
  color: string;
  onColorChange: (color: string) => void;
  icon: string;
  onIconChange: (icon: string) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  /** Colors already in use by other players — disabled in the picker. */
  usedColors: string[];
};

/** Name / color / icon / enabled fields shared by the add and edit player forms. */
export function PlayerFormFields({
  name,
  onNameChange,
  color,
  onColorChange,
  icon,
  onIconChange,
  enabled,
  onEnabledChange,
  usedColors,
}: PlayerFormFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-faint">NAME</p>
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Player name"
          className="w-full rounded-xl border border-border-strong bg-panel px-4 py-3 text-[15px] font-bold outline-none focus:border-accent-cyan/60"
          style={{ color }}
        />
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-faint">COLOR</p>
        <div className="flex flex-wrap gap-3">
          {PLAYER_COLORS.map((c) => {
            const taken = usedColors.includes(c) && c !== color;
            const selected = color === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onColorChange(c)}
                disabled={taken}
                title={taken ? "Already used by another player" : undefined}
                aria-label={c}
                aria-pressed={selected}
                className="h-9 w-9 rounded-full transition disabled:cursor-not-allowed disabled:opacity-25"
                style={{
                  backgroundColor: c,
                  boxShadow: selected ? `0 0 0 3px var(--color-panel-inset), 0 0 0 5px ${c}, 0 0 12px ${c}b3` : undefined,
                }}
              />
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-faint">ICON</p>
        <div className="flex gap-3">
          {PLAYER_ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => onIconChange(i)}
              aria-pressed={icon === i}
              className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl border-[1.5px] bg-panel text-2xl transition ${
                icon === i ? "border-accent-cyan/50 shadow-[0_0_12px_rgba(34,211,238,0.3)]" : "border-border"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#cbd5e1]">Active in rotation</span>
        <Switch checked={enabled} onChange={onEnabledChange} aria-label="Active in rotation" />
      </div>
    </div>
  );
}

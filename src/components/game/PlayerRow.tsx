import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil } from "lucide-react";
import type { PlayerSummary } from "@/lib/players";
import { Switch } from "@/components/ui/Switch";

type PlayerRowProps = {
  player: PlayerSummary;
  isCurrent: boolean;
  onToggleEnabled: () => void;
  onEdit: () => void;
  onSelect: () => void;
};

/** One draggable row in the Players pane. */
export function PlayerRow({ player, isCurrent, onToggleEnabled, onEdit, onSelect }: PlayerRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-2xl border bg-panel px-3 py-2.5 transition ${
        isCurrent ? "border-accent-cyan/35" : "border-border"
      } ${isDragging ? "z-10 opacity-50" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="touch-none cursor-grab text-faint active:cursor-grabbing"
      >
        <GripVertical size={16} aria-hidden="true" />
      </button>

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0a0b14] text-lg"
        style={{
          boxShadow: isCurrent ? `0 0 0 1.5px ${player.color}, 0 0 10px ${player.color}99` : `0 0 0 1.5px ${player.color}66`,
        }}
      >
        {player.icon}
      </div>

      <button
        type="button"
        onClick={onSelect}
        disabled={isCurrent}
        className="flex flex-1 items-center gap-2 truncate text-left disabled:cursor-default"
      >
        <span
          className="truncate text-[15px] font-bold"
          style={{ color: player.color, opacity: player.enabled ? 1 : 0.5 }}
        >
          {player.name}
        </span>
        {isCurrent && (
          <span className="shrink-0 rounded-full bg-accent-cyan/10 px-2 py-0.5 text-[9px] font-bold tracking-[0.08em] text-accent-cyan">
            CURRENT
          </span>
        )}
      </button>

      <Switch checked={player.enabled} onChange={onToggleEnabled} aria-label={`Enable ${player.name}`} />

      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${player.name}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-white/5"
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

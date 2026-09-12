import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, UserCheck } from "lucide-react";
import type { PlayerSummary } from "@/lib/players";

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
      className={`flex items-center gap-2 rounded-xl p-2 ${
        isCurrent ? "bg-neutral-100 dark:bg-neutral-900" : ""
      } ${isDragging ? "z-10 opacity-50" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="touch-none cursor-grab p-1 text-neutral-400 active:cursor-grabbing"
      >
        <GripVertical size={18} />
      </button>

      <input
        type="checkbox"
        checked={player.enabled}
        onChange={onToggleEnabled}
        aria-label={`Enable ${player.name}`}
        className="h-5 w-5 shrink-0 accent-neutral-900 dark:accent-neutral-100"
      />

      <span aria-hidden="true" className="text-lg">
        {player.icon}
      </span>

      <span
        className={`flex-1 truncate font-medium ${player.enabled ? "" : "opacity-50"}`}
        style={{ color: player.color }}
      >
        {player.name}
      </span>

      <button
        type="button"
        onClick={onSelect}
        disabled={isCurrent}
        aria-label={`Make ${player.name} the current player`}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800"
      >
        <UserCheck size={18} />
      </button>

      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${player.name}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
      >
        <Pencil size={18} />
      </button>
    </div>
  );
}

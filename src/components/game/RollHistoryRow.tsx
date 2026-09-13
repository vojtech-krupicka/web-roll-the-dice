"use client";

import { useState, type ReactNode } from "react";
import { AlignCenter, ChevronsDown, ChevronsUp, Clock, Gauge } from "lucide-react";
import type { PlayerSummary } from "@/lib/players";
import type { RollSummary } from "@/lib/rolls";
import { Switch } from "@/components/ui/Switch";

type RollHistoryRowProps = {
  roll: RollSummary;
  player: PlayerSummary | undefined;
  onToggleValid: () => void;
};

/** One roll in the history list — expands in place to show the full breakdown. */
export function RollHistoryRow({ roll, player, onToggleValid }: RollHistoryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const parts = formatRollBreakdown(roll.data);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-panel">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition"
        style={{ opacity: roll.isValid ? 1 : 0.5 }}
      >
        <span aria-hidden="true">{player?.icon}</span>

        <span
          className={`flex-1 truncate text-sm font-bold ${roll.isValid ? "" : "line-through"}`}
          style={{ color: player?.color }}
        >
          {player?.name ?? "Unknown player"}
        </span>

        <span className={`text-lg font-bold tabular-nums ${roll.isValid ? "" : "line-through"}`}>
          {roll.data.sum}
        </span>

        <span onClick={(event) => event.stopPropagation()}>
          <Switch checked={roll.isValid} onChange={onToggleValid} aria-label="Roll is valid" />
        </span>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center justify-end gap-1 text-xs text-faint">
            <Clock size={12} aria-hidden="true" />
            {roll.createdAt.toLocaleString()}
          </div>

          <div className="mt-1 flex flex-wrap items-center text-sm text-muted">
            {parts.map((part, index) => (
              <span key={index}>
                {index > 0 && <span className="mx-1 text-faint">+</span>}
                <span className={part.isMin || part.isMax ? "text-accent-cyan" : undefined}>
                  d{part.sides}({part.value})
                </span>
              </span>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Stat icon={<Gauge size={14} aria-hidden="true" />} label="Avg" value={roll.data.avg} />
            <Stat
              icon={<AlignCenter size={14} aria-hidden="true" />}
              label="Median"
              value={roll.data.median}
            />
            <Stat icon={<ChevronsDown size={14} aria-hidden="true" />} label="Min" value={roll.data.min} />
            <Stat icon={<ChevronsUp size={14} aria-hidden="true" />} label="Max" value={roll.data.max} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-muted">
      {icon}
      <span>{label}:</span>
      <span className="font-semibold text-foreground">{formatNumber(value)}</span>
    </div>
  );
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

type BreakdownPart = { sides: string; value: number; isMin: boolean; isMax: boolean };

function formatRollBreakdown(data: RollSummary["data"]): BreakdownPart[] {
  return Object.keys(data.roll).flatMap((sides) =>
    data.roll[sides].map((value) => ({
      sides,
      value,
      isMin: value === data.min,
      isMax: value === data.max,
    })),
  );
}

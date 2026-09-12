"use client";

import { useState, type ReactNode } from "react";
import { AlignCenter, ChevronsDown, ChevronsUp, Clock, Gauge } from "lucide-react";
import type { PlayerSummary } from "@/lib/players";
import type { RollSummary } from "@/lib/rolls";

type RollHistoryRowProps = {
  roll: RollSummary;
  player: PlayerSummary | undefined;
  striped: boolean;
  onToggleValid: () => void;
};

/** One roll in the history list — expands in place to show the full breakdown. */
export function RollHistoryRow({ roll, player, striped, onToggleValid }: RollHistoryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const parts = formatRollBreakdown(roll.data);

  return (
    <div className={striped ? "bg-neutral-50 dark:bg-neutral-900/50" : ""}>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
          roll.isValid ? "" : "opacity-50"
        }`}
      >
        <input
          type="checkbox"
          checked={roll.isValid}
          onClick={(event) => event.stopPropagation()}
          onChange={onToggleValid}
          aria-label="Roll is valid"
          className="h-5 w-5 shrink-0 accent-neutral-900 dark:accent-neutral-100"
        />

        <span aria-hidden="true">{player?.icon}</span>

        <span
          className={`flex-1 truncate font-medium ${roll.isValid ? "" : "line-through"}`}
          style={{ color: player?.color }}
        >
          {player?.name ?? "Unknown player"}
        </span>

        <span className={`text-lg font-bold tabular-nums ${roll.isValid ? "" : "line-through"}`}>
          {roll.data.sum}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-neutral-200 px-3 py-3 dark:border-neutral-800">
          <div className="flex items-center justify-end gap-1 text-xs text-neutral-400 dark:text-neutral-500">
            <Clock size={12} aria-hidden="true" />
            {roll.createdAt.toLocaleString()}
          </div>

          <div className="mt-1 flex flex-wrap items-center text-sm">
            {parts.map((part, index) => (
              <span key={index}>
                {index > 0 && <span className="mx-1 text-neutral-400 dark:text-neutral-600">+</span>}
                <span
                  className={
                    part.isMin || part.isMax ? "text-blue-600 dark:text-blue-400" : undefined
                  }
                >
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
    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
      {icon}
      <span>{label}:</span>
      <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatNumber(value)}</span>
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

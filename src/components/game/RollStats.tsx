import type { ReactNode } from "react";
import { AlignCenter, ChevronsDown, ChevronsUp, Gauge } from "lucide-react";
import { formatNumber } from "@/lib/rolls";

type RollStatsProps = {
  avg: number;
  median: number;
  min: number;
  max: number;
};

/** The avg/median/min/max stat grid — shared by the roll history row and the result popup. */
export function RollStats({ avg, median, min, max }: RollStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      <Stat icon={<Gauge size={14} aria-hidden="true" />} label="Avg" value={avg} />
      <Stat icon={<AlignCenter size={14} aria-hidden="true" />} label="Median" value={median} />
      <Stat icon={<ChevronsDown size={14} aria-hidden="true" />} label="Min" value={min} />
      <Stat icon={<ChevronsUp size={14} aria-hidden="true" />} label="Max" value={max} />
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

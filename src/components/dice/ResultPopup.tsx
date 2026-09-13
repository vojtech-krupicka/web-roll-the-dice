"use client";

import { useEffect, useState } from "react";
import type { DieSides } from "@/lib/hand";
import { RollStats } from "@/components/game/RollStats";
import { DieSprite } from "./DieSprite";

type ResultDie = { key: string; sides: DieSides; value: number };

type ResultPopupProps = {
  playerName: string;
  playerColor: string;
  dice: ResultDie[];
  sum: number;
  avg: number;
  median: number;
  min: number;
  max: number;
};

/**
 * Big reveal panel shown above the bottom bar once every die has settled —
 * dismissed via the Roll FAB, which turns into an OK button while this is
 * showing (see RollButton's `showResult` prop).
 */
export function ResultPopup({ playerName, playerColor, dice, sum, avg, median, min, max }: ResultPopupProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="absolute inset-x-[-16px] top-0 bottom-[100px] z-[6] overflow-hidden rounded-[20px] border border-border bg-panel-inset">
      <div
        className={`flex h-full flex-col items-center overflow-y-auto px-6 pt-8 pb-6 text-center transition-all duration-300 ease-out ${
          entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        <p className="text-xl font-black">Congratulations!</p>
        <p className="mt-1 text-[15px] text-muted">
          <span className="font-bold" style={{ color: playerColor }}>
            {playerName}
          </span>{" "}
          rolled
        </p>
        <p
          className="mt-2 text-7xl font-black tabular-nums"
          style={{
            backgroundImage: "var(--gradient-accent)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}
        >
          {sum}
        </p>

        <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-4">
          {dice.map((die) => (
            <DieSprite
              key={die.key}
              sides={die.sides}
              value={die.value}
              color={playerColor}
              className="h-16 w-16 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]"
            />
          ))}
        </div>

        <div className="mt-8 w-full max-w-[260px]">
          <RollStats avg={avg} median={median} min={min} max={max} />
        </div>
      </div>
    </div>
  );
}

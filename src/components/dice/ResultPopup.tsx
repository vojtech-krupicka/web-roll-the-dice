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
 * Reveal banner shown at the top of the (blurred) drop area once every die
 * has settled — dismissed via the Roll FAB, which turns into an OK button
 * while this is showing (see RollButton's `showResult` prop), or via the
 * next-player pill.
 */
export function ResultPopup({ playerName, playerColor, dice, sum, avg, median, min, max }: ResultPopupProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="absolute inset-x-[-16px] top-1/2 z-[6] -translate-y-1/2 overflow-hidden border-y border-border bg-panel-inset">
      <div
        className={`flex flex-col items-center px-6 pt-6 pb-5 text-center transition-all duration-300 ease-out ${
          entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        <p className="text-lg font-black">Congratulations!</p>
        <p className="mt-1 text-sm text-muted">
          <span className="font-bold" style={{ color: playerColor }}>
            {playerName}
          </span>{" "}
          rolled
        </p>
        <p
          className="mt-1 text-6xl font-black tabular-nums"
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

        <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-3">
          {dice.map((die) => (
            <DieSprite
              key={die.key}
              sides={die.sides}
              value={die.value}
              color={playerColor}
              className="h-12 w-12 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]"
            />
          ))}
        </div>

        <div className="mt-4 w-full max-w-[260px]">
          <RollStats avg={avg} median={median} min={min} max={max} />
        </div>
      </div>
    </div>
  );
}

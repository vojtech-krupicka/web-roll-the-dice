"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { HandToggleButton } from "@/components/dice/HandToggleButton";
import { HandPane } from "@/components/dice/HandPane";
import { DropArea } from "@/components/dice/DropArea";
import { RollButton } from "@/components/dice/RollButton";
import { ResultPopup } from "@/components/dice/ResultPopup";
import { ROLL_ANIMATION_DURATION_MS, ROLL_TICK_INTERVAL_MS, rollDie } from "@/lib/dice";
import {
  DEFAULT_HAND,
  activeDiceCount,
  flattenHand,
  pruneEmptyEnabledEntries,
  type DieSides,
  type HandEntry,
} from "@/lib/hand";

type RollState = "idle" | "rolling" | "result";

export default function Home() {
  const [hand, setHand] = useState<HandEntry[]>(DEFAULT_HAND);
  const [handPaneOpen, setHandPaneOpen] = useState(false);
  const [handError, setHandError] = useState<string | null>(null);

  const [rollState, setRollState] = useState<RollState>("idle");
  const [faces, setFaces] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const diceInstances = useMemo(() => flattenHand(hand), [hand]);

  // Clean up any pending timers if the component unmounts mid-roll.
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleToggleHandPane() {
    if (!handPaneOpen) {
      setHandError(null);
      setResult(null);
      setRollState("idle");
      setHandPaneOpen(true);
      return;
    }

    if (activeDiceCount(hand) === 0) {
      setHandError("Select at least one die before closing your hand.");
      return;
    }

    setHand((prev) => pruneEmptyEnabledEntries(prev));
    setHandError(null);
    setHandPaneOpen(false);
  }

  function updateEntry(sides: DieSides, update: (entry: HandEntry) => HandEntry) {
    setHand((prev) => prev.map((entry) => (entry.sides === sides ? update(entry) : entry)));
  }

  function handleToggleEnabled(sides: DieSides) {
    updateEntry(sides, (entry) => {
      const enabled = !entry.enabled;
      // Turning a type off removes its dice; turning it back on starts from 0.
      return { ...entry, enabled, count: enabled ? entry.count : 0 };
    });
  }

  function handleIncrement(sides: DieSides) {
    updateEntry(sides, (entry) => ({ ...entry, count: entry.count + 1 }));
  }

  function handleDecrement(sides: DieSides) {
    updateEntry(sides, (entry) => ({ ...entry, count: Math.max(0, entry.count - 1) }));
  }

  function handleAddDieType(sides: DieSides) {
    setHand((prev) =>
      prev.some((entry) => entry.sides === sides)
        ? prev
        : [...prev, { sides, enabled: true, count: 0 }],
    );
  }

  function handleRoll() {
    if (rollState !== "idle" || diceInstances.length === 0) return;

    setRollState("rolling");
    intervalRef.current = setInterval(() => {
      setFaces(
        Object.fromEntries(diceInstances.map((die) => [die.key, rollDie(die.sides)])),
      );
    }, ROLL_TICK_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const finalFaces = Object.fromEntries(
        diceInstances.map((die) => [die.key, rollDie(die.sides)]),
      );
      setFaces(finalFaces);
      setResult(Object.values(finalFaces).reduce((sum, value) => sum + value, 0));
      setRollState("result");
    }, ROLL_ANIMATION_DURATION_MS);
  }

  function handleDismissResult() {
    setResult(null);
    setRollState("idle");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar>
        <HandToggleButton open={handPaneOpen} onClick={handleToggleHandPane} />
      </TopBar>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <DropArea
          dice={diceInstances.map((die) => ({
            key: die.key,
            sides: die.sides,
            face: faces[die.key] ?? 1,
          }))}
        />

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10">
          {rollState === "result" && result !== null && (
            <ResultPopup value={result} onDismiss={handleDismissResult} />
          )}
          <RollButton disabled={rollState !== "idle" || handPaneOpen} onClick={handleRoll} />
        </div>

        {handPaneOpen && (
          <HandPane
            hand={hand}
            error={handError}
            onToggleEnabled={handleToggleEnabled}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onAddDieType={handleAddDieType}
          />
        )}
      </div>
    </div>
  );
}

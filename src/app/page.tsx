"use client";

import { useEffect, useRef, useState } from "react";
import { DropArea } from "@/components/dice/DropArea";
import { RollButton } from "@/components/dice/RollButton";
import { ResultPopup } from "@/components/dice/ResultPopup";
import {
  ROLL_ANIMATION_DURATION_MS,
  ROLL_TICK_INTERVAL_MS,
  rollD6,
} from "@/lib/dice";

type RollState = "idle" | "rolling" | "result";

export default function Home() {
  const [state, setState] = useState<RollState>("idle");
  const [face, setFace] = useState(1);
  const [result, setResult] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up any pending timers if the component unmounts mid-roll.
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleRoll() {
    if (state !== "idle") return;

    setState("rolling");
    intervalRef.current = setInterval(() => {
      setFace(rollD6());
    }, ROLL_TICK_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const finalValue = rollD6();
      setFace(finalValue);
      setResult(finalValue);
      setState("result");
    }, ROLL_ANIMATION_DURATION_MS);
  }

  function handleDismiss() {
    setResult(null);
    setState("idle");
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <DropArea value={face} />

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10">
        {state === "result" && result !== null && (
          <ResultPopup value={result} onDismiss={handleDismiss} />
        )}
        <RollButton disabled={state !== "idle"} onClick={handleRoll} />
      </div>
    </main>
  );
}

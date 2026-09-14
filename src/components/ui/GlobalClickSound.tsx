"use client";

import { useEffect } from "react";
import { playClick, playRollSound } from "@/lib/sound";

/**
 * Plays a synthesized tap sound for every button click app-wide — mount
 * once near the root. A button can opt into a different sound via
 * `data-sound="roll"` (the Roll/OK FAB) or opt out with `data-sound="none"`.
 */
export function GlobalClickSound() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("button");
      if (!button || button.disabled) return;

      const sound = button.dataset.sound;
      if (sound === "none") return;
      if (sound === "roll") {
        playRollSound();
      } else {
        playClick();
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}

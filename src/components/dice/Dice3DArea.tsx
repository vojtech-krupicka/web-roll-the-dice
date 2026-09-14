"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { DieInstance } from "@/lib/hand";
import type DiceBox from "@3d-dice/dice-box";

export type Dice3DAreaHandle = {
  /** Rolls the given (non-coin) dice via physics and resolves with each die's final value, keyed by `die.key`. */
  roll: (dice: DieInstance[]) => Promise<Record<string, number>>;
  /** Removes any dice left sitting in the scene from a previous roll — call before showing a different player's hand. */
  clear: () => void;
};

type Dice3DAreaProps = {
  /**
   * Whether the physics animation should be visible right now. `DropArea`
   * is always the thing showing dice at rest and showing the settled
   * result (idle state, per-player resets, and coins all come for free
   * from it) — this canvas is only faded in as a transient overlay for the
   * few seconds a 3D roll is actually tumbling, then faded back out.
   */
  active: boolean;
};

const CONTAINER_ID = "dice-box-canvas";

/**
 * A transient overlay on top of `DropArea`, visible only while a 3D roll is
 * animating — dice are rolled by @3d-dice/dice-box (real gravity/bounce/
 * settle) instead of the CSS tumble. Coins (d2) aren't a supported die type
 * in dice-box's theme, so the caller is expected to roll those separately
 * and only pass polyhedral dice here.
 */
export const Dice3DArea = forwardRef<Dice3DAreaHandle, Dice3DAreaProps>(function Dice3DArea(
  { active },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const diceBoxRef = useRef<DiceBox | null>(null);
  const readyPromiseRef = useRef<Promise<void> | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readyPromiseRef.current = import("@3d-dice/dice-box")
      .then(async ({ default: DiceBoxCtor }) => {
        if (cancelled) return;
        const diceBox = new DiceBoxCtor({
          container: `#${CONTAINER_ID}`,
          assetPath: "/dice-box-assets/",
          scale: 4.5,
        });
        await diceBox.init();
        if (cancelled) return;
        // dice-box's canvas starts at the browser's default 300x150 —
        // it only re-reads the container's real size on a `window` resize
        // event, which never fires on its own here, so every die would
        // spawn/land using the wrong (tiny) coordinate space otherwise.
        diceBox.resizeWorld();
        diceBoxRef.current = diceBox;
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
      diceBoxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      diceBoxRef.current?.resizeWorld();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      async roll(dice) {
        if (dice.length === 0) return {};

        await readyPromiseRef.current;
        const diceBox = diceBoxRef.current;
        if (!diceBox) return {};

        const bySides = new Map<number, DieInstance[]>();
        dice.forEach((die) => {
          const group = bySides.get(die.sides) ?? [];
          group.push(die);
          bySides.set(die.sides, group);
        });

        const notation = Array.from(bySides.entries(), ([sides, group]) => ({ sides, qty: group.length }));
        const results = await diceBox.roll(notation);

        const byKey: Record<string, number> = {};
        bySides.forEach((group, sides) => {
          const values = results.filter((r) => r.sides === sides).map((r) => r.value);
          group.forEach((die, i) => {
            if (values[i] !== undefined) byKey[die.key] = values[i];
          });
        });
        return byKey;
      },
      clear() {
        diceBoxRef.current?.clear();
      },
    }),
    [],
  );

  return (
    <div
      className={`absolute top-[62px] right-0 bottom-[148px] left-0 z-[2] overflow-hidden pointer-events-none transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* dice-box's own canvas has no sizing of its own — without this it sits at the browser's intrinsic 300x150 default instead of filling the container. */}
      <style>{`#${CONTAINER_ID} canvas { width: 100% !important; height: 100% !important; display: block; }`}</style>
      <div id={CONTAINER_ID} ref={containerRef} className="absolute inset-0" />
      {loadFailed && active && (
        <div className="absolute inset-0 flex items-center justify-center bg-panel-inset px-6 text-center text-sm text-muted">
          3D dice couldn&apos;t load — rolls still work, just without the animation.
        </div>
      )}
    </div>
  );
});

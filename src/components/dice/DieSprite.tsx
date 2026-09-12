import type { DieSides } from "@/lib/hand";
import { DieFace } from "./DieFace";
import { NumberDieFace } from "./NumberDieFace";
import { CoinFace } from "./CoinFace";

type DieSpriteProps = {
  sides: DieSides;
  value: number;
  /** When set, tints the die in this color instead of the neutral palette. */
  color?: string;
  className?: string;
};

/** Picks the right sprite for a die type: coin, pip d6, or numbered face. */
export function DieSprite({ sides, value, color, className }: DieSpriteProps) {
  if (sides === 2) return <CoinFace value={value} color={color} className={className} />;
  if (sides === 6) return <DieFace value={value} color={color} className={className} />;
  return <NumberDieFace sides={sides} value={value} color={color} className={className} />;
}

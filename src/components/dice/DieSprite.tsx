import type { DieSides } from "@/lib/hand";
import { DieFace } from "./DieFace";
import { NumberDieFace } from "./NumberDieFace";
import { CoinFace } from "./CoinFace";

type DieSpriteProps = {
  sides: DieSides;
  value: number;
  className?: string;
};

/** Picks the right sprite for a die type: coin, pip d6, or numbered face. */
export function DieSprite({ sides, value, className }: DieSpriteProps) {
  if (sides === 2) return <CoinFace value={value} className={className} />;
  if (sides === 6) return <DieFace value={value} className={className} />;
  return <NumberDieFace sides={sides} value={value} className={className} />;
}

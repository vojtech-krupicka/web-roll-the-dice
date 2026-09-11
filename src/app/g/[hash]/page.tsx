import { Suspense } from "react";
import { redirect } from "next/navigation";
import { findGameByHash } from "@/lib/db/games";
import { isGameUnlocked } from "@/lib/session";
import { GameView } from "./GameView";

type GamePageProps = {
  params: Promise<{ hash: string }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { hash } = await params;
  const game = await findGameByHash(hash.toLowerCase());

  if (!game) {
    redirect("/?error=not-found");
  }

  if (game.passwordHash && !(await isGameUnlocked(game.id))) {
    redirect(`/?hash=${game.hash}`);
  }

  return (
    <Suspense>
      <GameView hash={game.hash} initialName={game.name} hasPassword={game.passwordHash !== null} />
    </Suspense>
  );
}

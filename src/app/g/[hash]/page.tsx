import { Suspense } from "react";
import { redirect } from "next/navigation";
import { findGameByHash } from "@/lib/db/games";
import { listPlayersForGame } from "@/lib/db/players";
import { listRollsForGame } from "@/lib/db/rolls";
import { isGameUnlocked } from "@/lib/session";
import { toPlayerSummary } from "@/lib/players";
import { toRollSummary } from "@/lib/rolls";
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

  const players = (await listPlayersForGame(game.id)).map(toPlayerSummary);
  const currentPlayerId = players.find((p) => p.id === game.currentPlayerId)?.id ?? players[0].id;
  const rolls = (await listRollsForGame(game.id)).map(toRollSummary);

  return (
    <Suspense>
      <GameView
        hash={game.hash}
        initialName={game.name}
        hasPassword={game.passwordHash !== null}
        initialPlayers={players}
        initialCurrentPlayerId={currentPlayerId}
        initialRolls={rolls}
        initialMode={game.settings.mode ?? "2d"}
      />
    </Suspense>
  );
}

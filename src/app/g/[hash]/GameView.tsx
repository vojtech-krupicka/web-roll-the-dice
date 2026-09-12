"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { HandToggleButton } from "@/components/dice/HandToggleButton";
import { HandPane } from "@/components/dice/HandPane";
import { DropArea } from "@/components/dice/DropArea";
import { RollButton } from "@/components/dice/RollButton";
import { ResultPopup } from "@/components/dice/ResultPopup";
import { SettingsButton } from "@/components/game/SettingsButton";
import { SettingsMenu } from "@/components/game/SettingsMenu";
import { GameHashDialog } from "@/components/game/GameHashDialog";
import { GameEditPane } from "@/components/game/GameEditPane";
import { CurrentPlayerBar } from "@/components/game/CurrentPlayerBar";
import { PlayersPane } from "@/components/game/PlayersPane";
import { NextPlayerButton } from "@/components/game/NextPlayerButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { updatePlayerHandAction, setCurrentPlayerAction } from "@/app/actions";
import { ROLL_TICK_INTERVAL_MS, randomRollDuration, rollDie } from "@/lib/dice";
import {
  DEFAULT_HAND,
  activeDiceCount,
  flattenHand,
  pruneEmptyEnabledEntries,
  type DieSides,
  type HandEntry,
} from "@/lib/hand";
import type { PlayerSummary } from "@/lib/players";

type RollState = "idle" | "rolling" | "result";

type GameViewProps = {
  hash: string;
  initialName: string;
  hasPassword: boolean;
  initialPlayers: PlayerSummary[];
  initialCurrentPlayerId: number;
};

export function GameView({
  hash,
  initialName,
  hasPassword: initialHasPassword,
  initialPlayers,
  initialCurrentPlayerId,
}: GameViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState(initialName);
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [welcomeOpen, setWelcomeOpen] = useState(searchParams.get("welcome") === "1");
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Drop the one-time `?welcome=1` marker from the URL once we've read it.
  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      router.replace(`/g/${hash}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Players ----

  const [players, setPlayers] = useState<PlayerSummary[]>(initialPlayers);
  const [currentPlayerId, setCurrentPlayerId] = useState(initialCurrentPlayerId);
  const [playersPaneOpen, setPlayersPaneOpen] = useState(false);
  const [nextPlayerConfirmOpen, setNextPlayerConfirmOpen] = useState(false);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);

  // ---- Hand of dice — now per-player, persisted on hand-pane close ----

  const [hand, setHand] = useState<HandEntry[]>(() => {
    const initialHand = initialPlayers.find((p) => p.id === initialCurrentPlayerId)?.currentHand;
    return initialHand && initialHand.length > 0 ? initialHand : DEFAULT_HAND;
  });
  const [handPaneOpen, setHandPaneOpen] = useState(false);
  const [handError, setHandError] = useState<string | null>(null);

  const [rollState, setRollState] = useState<RollState>("idle");
  const [faces, setFaces] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number | null>(null);
  const timersRef = useRef<{
    intervals: ReturnType<typeof setInterval>[];
    timeouts: ReturnType<typeof setTimeout>[];
  }>({ intervals: [], timeouts: [] });

  const diceInstances = useMemo(() => flattenHand(hand), [hand]);

  function clearRollTimers() {
    timersRef.current.intervals.forEach(clearInterval);
    timersRef.current.timeouts.forEach(clearTimeout);
    timersRef.current.intervals = [];
    timersRef.current.timeouts = [];
  }

  useEffect(() => {
    return () => clearRollTimers();
  }, []);

  function switchToPlayer(playerId: number) {
    const target = players.find((p) => p.id === playerId);
    if (!target) return;

    clearRollTimers();
    setCurrentPlayerId(playerId);
    setHand(target.currentHand.length > 0 ? target.currentHand : DEFAULT_HAND);
    setFaces({});
    setResult(null);
    setRollState("idle");
    setHandError(null);

    void setCurrentPlayerAction(hash, playerId);
  }

  function handleNextPlayer() {
    if (players.length <= 1) return;
    setNextPlayerConfirmOpen(true);
  }

  function handleNextPlayerConfirmed() {
    const currentIndex = players.findIndex((p) => p.id === currentPlayerId);
    const nextIndex = (currentIndex + 1) % players.length;
    switchToPlayer(players[nextIndex].id);
    setNextPlayerConfirmOpen(false);
  }

  function handleToggleHandPane() {
    if (!handPaneOpen) {
      clearRollTimers();
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

    const pruned = pruneEmptyEnabledEntries(hand);
    setHand(pruned);
    setHandError(null);
    setHandPaneOpen(false);

    if (currentPlayer) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === currentPlayer.id ? { ...p, currentHand: pruned } : p)),
      );
      void updatePlayerHandAction(currentPlayer.id, pruned);
    }
  }

  function updateEntry(sides: DieSides, update: (entry: HandEntry) => HandEntry) {
    setHand((prev) => prev.map((entry) => (entry.sides === sides ? update(entry) : entry)));
  }

  function handleToggleEnabled(sides: DieSides) {
    updateEntry(sides, (entry) => ({ ...entry, enabled: !entry.enabled }));
  }

  function handleIncrement(sides: DieSides) {
    updateEntry(sides, (entry) => ({ ...entry, count: entry.count + 1 }));
  }

  function handleDecrement(sides: DieSides) {
    updateEntry(sides, (entry) => ({ ...entry, count: Math.max(0, entry.count - 1) }));
  }

  function handleAddDieType(sides: DieSides) {
    setHand((prev) =>
      prev.some((entry) => entry.sides === sides) ? prev : [...prev, { sides, enabled: true, count: 1 }],
    );
  }

  function handleRoll() {
    if (rollState !== "idle" || diceInstances.length === 0 || !currentPlayer?.enabled) return;

    clearRollTimers();
    setRollState("rolling");

    const finalFaces: Record<string, number> = {};
    let settledCount = 0;

    diceInstances.forEach((die) => {
      const intervalId = setInterval(() => {
        setFaces((prev) => ({ ...prev, [die.key]: rollDie(die.sides) }));
      }, ROLL_TICK_INTERVAL_MS);
      timersRef.current.intervals.push(intervalId);

      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        const finalValue = rollDie(die.sides);
        finalFaces[die.key] = finalValue;
        setFaces((prev) => ({ ...prev, [die.key]: finalValue }));

        settledCount += 1;
        if (settledCount === diceInstances.length) {
          setResult(Object.values(finalFaces).reduce((sum, value) => sum + value, 0));
          setRollState("result");
        }
      }, randomRollDuration());
      timersRef.current.timeouts.push(timeoutId);
    });
  }

  function handleDismissResult() {
    setResult(null);
    setRollState("idle");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar
        left={
          <div className="relative">
            <SettingsButton onClick={() => setSettingsOpen(true)} />
            {settingsOpen && (
              <SettingsMenu hash={hash} onDismiss={() => setSettingsOpen(false)} />
            )}
          </div>
        }
        center={
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="truncate text-base font-semibold"
          >
            {name}
          </button>
        }
        right={<HandToggleButton open={handPaneOpen} onClick={handleToggleHandPane} />}
      />

      <CurrentPlayerBar player={currentPlayer} onClick={() => setPlayersPaneOpen(true)} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <DropArea
          dice={diceInstances.map((die) => ({
            key: die.key,
            sides: die.sides,
            face: faces[die.key] ?? 1,
          }))}
          color={currentPlayer?.color}
        />

        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-10">
          {rollState === "result" && result !== null && (
            <ResultPopup value={result} onDismiss={handleDismissResult} />
          )}
          <div className="flex w-full max-w-sm items-stretch gap-3">
            <RollButton
              disabled={rollState !== "idle" || handPaneOpen || !currentPlayer?.enabled}
              onClick={handleRoll}
            />
            <NextPlayerButton disabled={players.length <= 1} onClick={handleNextPlayer} />
          </div>
        </div>

        {handPaneOpen && (
          <HandPane
            hand={hand}
            color={currentPlayer?.color}
            error={handError}
            onToggleEnabled={handleToggleEnabled}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onAddDieType={handleAddDieType}
          />
        )}
      </div>

      {welcomeOpen && <GameHashDialog hash={hash} onDismiss={() => setWelcomeOpen(false)} />}

      {editOpen && (
        <GameEditPane
          hash={hash}
          name={name}
          hasPassword={hasPassword}
          onNameChange={setName}
          onPasswordChanged={() => setHasPassword(true)}
          onDismiss={() => setEditOpen(false)}
        />
      )}

      {playersPaneOpen && (
        <PlayersPane
          hash={hash}
          players={players}
          currentPlayerId={currentPlayerId}
          onPlayersChange={setPlayers}
          onSwitchPlayer={switchToPlayer}
          onDismiss={() => setPlayersPaneOpen(false)}
        />
      )}

      {nextPlayerConfirmOpen && (
        <ConfirmDialog
          title="Switch player?"
          message="Move on to the next player?"
          confirmLabel="Switch"
          onConfirm={handleNextPlayerConfirmed}
          onCancel={() => setNextPlayerConfirmOpen(false)}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { BottomBar } from "@/components/layout/BottomBar";
import { HandPane } from "@/components/dice/HandPane";
import { DropArea } from "@/components/dice/DropArea";
import { RollButton } from "@/components/dice/RollButton";
import { ResultPopup } from "@/components/dice/ResultPopup";
import { LeaveButton } from "@/components/game/LeaveButton";
import { SettingsButton } from "@/components/game/SettingsButton";
import { SettingsMenu } from "@/components/game/SettingsMenu";
import { GameHashDialog } from "@/components/game/GameHashDialog";
import { GameEditPane } from "@/components/game/GameEditPane";
import { CurrentPlayerBadge } from "@/components/game/CurrentPlayerBadge";
import { PlayersPane } from "@/components/game/PlayersPane";
import { PlayerFormPane, type PlayerFormValues } from "@/components/game/PlayerFormPane";
import { NextPlayerPill } from "@/components/game/NextPlayerPill";
import { RollHistoryPill } from "@/components/game/RollHistoryPill";
import { RollHistoryDialog } from "@/components/game/RollHistoryDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  recordRollAction,
  setCurrentPlayerAction,
  updatePlayerAction,
  updatePlayerHandAction,
} from "@/app/actions";
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
import { computeRollData, type RollSummary } from "@/lib/rolls";

type RollState = "idle" | "rolling" | "result";
type ActiveDialog = "players" | "hand" | null;

type GameViewProps = {
  hash: string;
  initialName: string;
  hasPassword: boolean;
  initialPlayers: PlayerSummary[];
  initialCurrentPlayerId: number;
  initialRolls: RollSummary[];
};

export function GameView({
  hash,
  initialName,
  hasPassword: initialHasPassword,
  initialPlayers,
  initialCurrentPlayerId,
  initialRolls,
}: GameViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState(initialName);
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [welcomeOpen, setWelcomeOpen] = useState(searchParams.get("welcome") === "1");
  const [editOpen, setEditOpen] = useState(false);
  const [editPlayerOpen, setEditPlayerOpen] = useState(false);
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
  const [nextPlayerConfirmOpen, setNextPlayerConfirmOpen] = useState(false);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);

  // ---- Roll history ----

  const [rolls, setRolls] = useState<RollSummary[]>(initialRolls);
  const [historyOpen, setHistoryOpen] = useState(false);
  const lastRoll = rolls[0];
  const lastRollPlayer = lastRoll ? players.find((p) => p.id === lastRoll.playerId) : undefined;

  // ---- Hand of dice — now per-player, persisted on hand-pane close ----

  const [hand, setHand] = useState<HandEntry[]>(() => {
    const initialHand = initialPlayers.find((p) => p.id === initialCurrentPlayerId)?.currentHand;
    return initialHand && initialHand.length > 0 ? initialHand : DEFAULT_HAND;
  });
  const [handError, setHandError] = useState<string | null>(null);

  // ---- Players/Hand bottom-bar navigation — mutually exclusive ----

  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

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

  /** Switches which bottom-bar dialog is open (or closes it), validating/persisting the hand first if leaving it. */
  function requestActiveDialog(target: ActiveDialog) {
    if (activeDialog === "hand" && target !== "hand") {
      if (activeDiceCount(hand) === 0) {
        setHandError("Select at least one die before closing your hand.");
        return;
      }
      const pruned = pruneEmptyEnabledEntries(hand);
      setHand(pruned);
      setHandError(null);
      if (currentPlayer) {
        setPlayers((prev) =>
          prev.map((p) => (p.id === currentPlayer.id ? { ...p, currentHand: pruned } : p)),
        );
        void updatePlayerHandAction(currentPlayer.id, pruned);
      }
    }

    if (target === "hand") {
      clearRollTimers();
      setHandError(null);
      setResult(null);
      setRollState("idle");
    }

    setActiveDialog(target);
  }

  function goToPlayers() {
    requestActiveDialog(activeDialog === "players" ? null : "players");
  }

  function goToHand() {
    requestActiveDialog(activeDialog === "hand" ? null : "hand");
  }

  function closeWelcomeThenGoToPlayers() {
    setWelcomeOpen(false);
    goToPlayers();
  }

  function closeWelcomeThenGoToHand() {
    setWelcomeOpen(false);
    goToHand();
  }

  function closeEditThenGoToPlayers() {
    setEditOpen(false);
    goToPlayers();
  }

  function closeEditThenGoToHand() {
    setEditOpen(false);
    goToHand();
  }

  function closeHistoryThenGoToPlayers() {
    setHistoryOpen(false);
    goToPlayers();
  }

  function closeHistoryThenGoToHand() {
    setHistoryOpen(false);
    goToHand();
  }

  function closeEditPlayerThenGoToPlayers() {
    setEditPlayerOpen(false);
    goToPlayers();
  }

  function closeEditPlayerThenGoToHand() {
    setEditPlayerOpen(false);
    goToHand();
  }

  async function handleEditCurrentPlayerSubmit(playerId: number, values: PlayerFormValues) {
    const result = await updatePlayerAction(playerId, values);
    if (result.ok) {
      setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, ...values } : p)));
    }
    setEditPlayerOpen(false);
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

      const timeoutId = setTimeout(async () => {
        clearInterval(intervalId);
        const finalValue = rollDie(die.sides);
        finalFaces[die.key] = finalValue;
        setFaces((prev) => ({ ...prev, [die.key]: finalValue }));

        settledCount += 1;
        if (settledCount === diceInstances.length) {
          const rollData = computeRollData(
            diceInstances.map((d) => ({ sides: d.sides, value: finalFaces[d.key] })),
          );
          setResult(rollData.sum);
          setRollState("result");

          if (currentPlayer) {
            const response = await recordRollAction(hash, currentPlayer.id, rollData);
            if (response.ok) {
              setRolls((prev) => [response.data.roll, ...prev]);
            }
          }
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
        left={<LeaveButton hash={hash} />}
        center={
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="truncate text-sm font-bold"
          >
            {name}
          </button>
        }
        right={
          <div className="relative">
            <SettingsButton onClick={() => setSettingsOpen(true)} />
            {settingsOpen && (
              <SettingsMenu hash={hash} onDismiss={() => setSettingsOpen(false)} />
            )}
          </div>
        }
      />

      <div className="relative mx-4 mt-[18px] flex-1">
        <DropArea
          dice={diceInstances.map((die) => ({
            key: die.key,
            sides: die.sides,
            face: faces[die.key] ?? 1,
          }))}
          color={currentPlayer?.color}
        />

        <CurrentPlayerBadge player={currentPlayer} onClick={() => setEditPlayerOpen(true)} />

        <RollHistoryPill
          lastRoll={lastRoll}
          lastRollPlayer={lastRollPlayer}
          onClick={() => setHistoryOpen(true)}
        />
        <NextPlayerPill disabled={players.length <= 1} onClick={handleNextPlayer} />

        <BottomBar active={activeDialog} onPlayers={goToPlayers} onHand={goToHand} />

        <RollButton
          disabled={rollState !== "idle" || activeDialog === "hand" || !currentPlayer?.enabled}
          onClick={handleRoll}
        />

        {rollState === "result" && result !== null && (
          <ResultPopup value={result} onDismiss={handleDismissResult} />
        )}

        {activeDialog === "hand" && (
          <HandPane
            hand={hand}
            color={currentPlayer?.color}
            error={handError}
            bottomNav={{
              active: activeDialog,
              onPlayers: () => requestActiveDialog("players"),
              onHand: () => requestActiveDialog(null),
            }}
            onToggleEnabled={handleToggleEnabled}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onAddDieType={handleAddDieType}
          />
        )}
      </div>

      {welcomeOpen && (
        <GameHashDialog
          hash={hash}
          bottomNav={{ active: activeDialog, onPlayers: closeWelcomeThenGoToPlayers, onHand: closeWelcomeThenGoToHand }}
          onDismiss={() => setWelcomeOpen(false)}
        />
      )}

      {editOpen && (
        <GameEditPane
          hash={hash}
          name={name}
          hasPassword={hasPassword}
          bottomNav={{ active: activeDialog, onPlayers: closeEditThenGoToPlayers, onHand: closeEditThenGoToHand }}
          onNameChange={setName}
          onPasswordChanged={() => setHasPassword(true)}
          onDismiss={() => setEditOpen(false)}
        />
      )}

      {editPlayerOpen && currentPlayer && (
        <PlayerFormPane
          mode="edit"
          initial={currentPlayer}
          defaultName={currentPlayer.name}
          usedColors={players.filter((p) => p.id !== currentPlayer.id).map((p) => p.color)}
          bottomNav={{
            active: activeDialog,
            onPlayers: closeEditPlayerThenGoToPlayers,
            onHand: closeEditPlayerThenGoToHand,
          }}
          onSubmit={(values) => handleEditCurrentPlayerSubmit(currentPlayer.id, values)}
          onDismiss={() => setEditPlayerOpen(false)}
        />
      )}

      {activeDialog === "players" && (
        <PlayersPane
          hash={hash}
          players={players}
          currentPlayerId={currentPlayerId}
          bottomNav={{
            active: activeDialog,
            onPlayers: () => requestActiveDialog(null),
            onHand: () => requestActiveDialog("hand"),
          }}
          onPlayersChange={setPlayers}
          onSwitchPlayer={switchToPlayer}
          onDismiss={() => requestActiveDialog(null)}
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

      {historyOpen && (
        <RollHistoryDialog
          rolls={rolls}
          players={players}
          bottomNav={{ active: activeDialog, onPlayers: closeHistoryThenGoToPlayers, onHand: closeHistoryThenGoToHand }}
          onRollsChange={setRolls}
          onDismiss={() => setHistoryOpen(false)}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { BottomBar } from "@/components/layout/BottomBar";
import { HandPane } from "@/components/dice/HandPane";
import { DropArea } from "@/components/dice/DropArea";
import { Dice3DArea, type Dice3DAreaHandle } from "@/components/dice/Dice3DArea";
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
import { playDiceClack, playResultChime, ROLL_PRESS_SOUND_DURATION_MS } from "@/lib/sound";
import {
  recordRollAction,
  setCurrentPlayerAction,
  updatePlayerAction,
  updatePlayerHandAction,
} from "@/app/actions";
import {
  DIE_REST_TUMBLE,
  randomRevealDelay,
  randomRollDuration,
  randomTumble,
  rollDie,
  tickIntervalForProgress,
  tumbleIntensityForProgress,
  type DieTumble,
} from "@/lib/dice";
import {
  DEFAULT_HAND,
  flattenHand,
  pruneEmptyEnabledEntries,
  type DieInstance,
  type DieSides,
  type HandEntry,
} from "@/lib/hand";
import type { PlayerSummary } from "@/lib/players";
import { computeRollData, type RollSummary } from "@/lib/rolls";
import type { GameSettings } from "@/lib/db/schema";
import { prefersReducedMotion } from "@/lib/motion";

type RollState = "idle" | "rolling" | "result";
type ActiveDialog = "players" | "hand" | null;

type RollResult = {
  playerName: string;
  playerColor: string;
  dice: { key: string; sides: DieSides; value: number }[];
  sum: number;
  avg: number;
  median: number;
  min: number;
  max: number;
};

type RollMode = NonNullable<GameSettings["mode"]>;

type GameViewProps = {
  hash: string;
  initialName: string;
  hasPassword: boolean;
  initialPlayers: PlayerSummary[];
  initialCurrentPlayerId: number;
  initialRolls: RollSummary[];
  initialMode: RollMode;
};

export function GameView({
  hash,
  initialName,
  hasPassword: initialHasPassword,
  initialPlayers,
  initialCurrentPlayerId,
  initialRolls,
  initialMode,
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

  // ---- Players/Hand bottom-bar navigation — mutually exclusive ----

  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  const [mode, setMode] = useState<RollMode>(initialMode);
  const [dice3DActive, setDice3DActive] = useState(false);
  const dice3DRef = useRef<Dice3DAreaHandle>(null);

  const [rollState, setRollState] = useState<RollState>("idle");
  const [faces, setFaces] = useState<Record<string, number>>({});
  const [result, setResult] = useState<RollResult | null>(null);
  const [settled, setSettled] = useState<Record<string, boolean>>({});
  const [tumble, setTumble] = useState<Record<string, DieTumble>>({});
  const timersRef = useRef<{ timeouts: ReturnType<typeof setTimeout>[] }>({ timeouts: [] });

  const diceInstances = useMemo(() => flattenHand(hand), [hand]);

  function clearRollTimers() {
    timersRef.current.timeouts.forEach(clearTimeout);
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
    setDice3DActive(false);
    dice3DRef.current?.clear();

    void setCurrentPlayerAction(hash, playerId);
  }

  function handleNextPlayer() {
    setSettingsOpen(false);
    if (rollState === "result") {
      setResult(null);
      setRollState("idle");
    }
    if (players.length <= 1) return;
    setNextPlayerConfirmOpen(true);
  }

  function handleNextPlayerConfirmed() {
    const currentIndex = players.findIndex((p) => p.id === currentPlayerId);
    const nextIndex = (currentIndex + 1) % players.length;
    switchToPlayer(players[nextIndex].id);
    setNextPlayerConfirmOpen(false);
  }

  /** Switches which bottom-bar dialog is open (or closes it), persisting the hand first if leaving it. */
  function requestActiveDialog(target: ActiveDialog) {
    setSettingsOpen(false);
    if (activeDialog === "hand" && target !== "hand") {
      const pruned = pruneEmptyEnabledEntries(hand);
      setHand(pruned);
      if (currentPlayer) {
        setPlayers((prev) =>
          prev.map((p) => (p.id === currentPlayer.id ? { ...p, currentHand: pruned } : p)),
        );
        void updatePlayerHandAction(currentPlayer.id, pruned);
      }
    }

    if (target === "hand") {
      clearRollTimers();
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

  /** Builds the result banner + roll history entry from every die's final value, shared by both roll modes. */
  async function finishRoll(finalFaces: Record<string, number>) {
    const rollData = computeRollData(diceInstances.map((d) => ({ sides: d.sides, value: finalFaces[d.key] })));
    setResult({
      playerName: currentPlayer?.name ?? "Unknown player",
      playerColor: currentPlayer?.color ?? "#9ca3af",
      dice: diceInstances.map((d) => ({ key: d.key, sides: d.sides, value: finalFaces[d.key] })),
      sum: rollData.sum,
      avg: rollData.avg,
      median: rollData.median,
      min: rollData.min,
      max: rollData.max,
    });
    setRollState("result");
    playResultChime();
    // Reset every die's tumble back to rest now that the result banner is
    // about to show — values stay, positions/rotations reset.
    setTumble({});

    if (currentPlayer) {
      const response = await recordRollAction(hash, currentPlayer.id, rollData);
      if (response.ok) {
        setRolls((prev) => [response.data.roll, ...prev]);
      }
    }
  }

  function runRoll2D() {
    // With reduced motion, keep the same timing/sound so a roll doesn't
    // feel broken or instant — just drop the spatial tumble and let dice
    // settle in place while their faces flicker through values.
    const reducedMotion = prefersReducedMotion();
    const finalFaces: Record<string, number> = {};
    let settledCount = 0;

    function scheduleReveal() {
      const timeoutId = setTimeout(() => {
        void finishRoll(finalFaces);
      }, randomRevealDelay());
      timersRef.current.timeouts.push(timeoutId);
    }

    diceInstances.forEach((die) => {
      const duration = randomRollDuration();
      const startedAt = Date.now();

      function tick() {
        const progress = Math.min((Date.now() - startedAt) / duration, 1);

        if (progress >= 1) {
          const finalValue = rollDie(die.sides);
          finalFaces[die.key] = finalValue;
          setFaces((prev) => ({ ...prev, [die.key]: finalValue }));
          setSettled((prev) => ({ ...prev, [die.key]: true }));
          playDiceClack(die.sides, true);
          // Leave this die's tumble as-is — it stays put where it landed
          // until the whole roll finishes, rather than snapping back
          // individually.

          settledCount += 1;
          if (settledCount === diceInstances.length) scheduleReveal();
          return;
        }

        setFaces((prev) => ({ ...prev, [die.key]: rollDie(die.sides) }));
        // Tumble eases off (smaller moves) the closer this die is to settling.
        setTumble((prev) => ({
          ...prev,
          [die.key]: reducedMotion ? DIE_REST_TUMBLE : randomTumble(tumbleIntensityForProgress(progress)),
        }));
        playDiceClack(die.sides);

        const timeoutId = setTimeout(tick, tickIntervalForProgress(progress));
        timersRef.current.timeouts.push(timeoutId);
      }

      const timeoutId = setTimeout(tick, tickIntervalForProgress(0));
      timersRef.current.timeouts.push(timeoutId);
    });
  }

  /**
   * dice-box (the 3D physics engine) has no coin/d2 die type in its theme,
   * so coins get their own lightweight flip animation (reusing the 2D
   * tumble/flicker) for as long as the real physics roll is running,
   * instead of just sitting there inert while the other dice tumble. Both
   * are combined into one result once the physics settles. Falls back to
   * instant rolls for everyone if the 3D canvas isn't ready or its roll
   * fails, so a broken/loading 3D view never blocks a roll.
   */
  async function runRoll3D() {
    const coinDice = diceInstances.filter((die) => die.sides === 2);
    const polyhedralDice: DieInstance[] = diceInstances.filter((die) => die.sides !== 2);
    const finalFaces: Record<string, number> = {};

    let coinFlipInterval: ReturnType<typeof setInterval> | undefined;
    if (coinDice.length > 0) {
      coinFlipInterval = setInterval(() => {
        coinDice.forEach((die) => {
          setFaces((prev) => ({ ...prev, [die.key]: rollDie(2) }));
          setTumble((prev) => ({ ...prev, [die.key]: randomTumble(1) }));
        });
      }, 120);
      timersRef.current.timeouts.push(coinFlipInterval);
    }

    // dice-box doesn't expose a clean "this one die just landed" event, so
    // each polyhedral die gets its own simulated landing clack at a
    // randomized point during the roll — same timing range 2D dice use —
    // instead of one clack lumped at the very end.
    const clackTimers = polyhedralDice.map((die) =>
      setTimeout(() => playDiceClack(die.sides, true), randomRollDuration()),
    );
    clackTimers.forEach((id) => timersRef.current.timeouts.push(id));

    if (polyhedralDice.length > 0) {
      try {
        const results = dice3DRef.current
          ? await dice3DRef.current.roll(polyhedralDice, currentPlayer?.color)
          : {};
        polyhedralDice.forEach((die) => {
          finalFaces[die.key] = results[die.key] ?? rollDie(die.sides);
        });
      } catch {
        polyhedralDice.forEach((die) => {
          finalFaces[die.key] = rollDie(die.sides);
        });
      }
    } else if (coinDice.length > 0) {
      // No polyhedral dice to wait on — still give the coin flip a moment
      // to play rather than resolving the "roll" instantly.
      await new Promise<void>((resolve) => {
        const timeoutId = setTimeout(resolve, randomRollDuration());
        timersRef.current.timeouts.push(timeoutId);
      });
    }

    clackTimers.forEach(clearTimeout);
    if (coinFlipInterval !== undefined) clearInterval(coinFlipInterval);
    coinDice.forEach((die) => {
      finalFaces[die.key] = rollDie(2);
    });
    // Coins don't go through dice-box at all, so they get their own landing
    // sound here instead of one of the staggered polyhedral clacks above.
    if (coinDice.length > 0) playDiceClack(2, true);

    // Queue up the settled flat sprites now, but keep the 3D canvas showing
    // them at rest — swapping back to the flat sprites happens below, timed
    // to land exactly when the result banner appears, so the model swap is
    // covered by the banner instead of flashing on its own first.
    setFaces(finalFaces);
    setTumble({});
    setSettled(Object.fromEntries(diceInstances.map((die) => [die.key, true])));

    const timeoutId = setTimeout(() => {
      setDice3DActive(false);
      void finishRoll(finalFaces);
    }, randomRevealDelay());
    timersRef.current.timeouts.push(timeoutId);
  }

  function handleRoll() {
    if (rollState !== "idle" || diceInstances.length === 0 || !currentPlayer?.enabled) return;

    // With reduced motion, always take the 2D (flicker, no tumble) path —
    // the 3D physics show is motion by definition, so there's no reduced
    // version of it to fall back to beyond not playing it at all.
    const use3D = mode === "3d" && !prefersReducedMotion();

    setSettingsOpen(false);
    clearRollTimers();
    setRollState("rolling");
    setSettled({});
    setTumble({});
    // In 3D mode, hide the flat sprites (except coins) the instant the
    // press registers — not just once the physics animation actually
    // starts — so they don't sit there showing last roll's stale faces
    // while the shake sound plays. Clear the 3D scene right away too — a
    // second roll would otherwise reveal the *previous* roll's dice still
    // sitting in their landed spots for that same instant, since dice-box
    // itself only clears at the start of its own next roll() call.
    if (use3D) {
      dice3DRef.current?.clear();
      setDice3DActive(true);
    } else {
      setDice3DActive(false);
    }

    // The Roll button's own press sound (a ~1.5s "shake") plays the moment
    // it's clicked, via GlobalClickSound — wait for it to finish before the
    // dice actually start moving/making their own sounds, so the two don't
    // overlap and clash.
    const timeoutId = setTimeout(() => {
      if (use3D) {
        void runRoll3D();
      } else {
        runRoll2D();
      }
    }, ROLL_PRESS_SOUND_DURATION_MS);
    timersRef.current.timeouts.push(timeoutId);
  }

  function handleDismissResult() {
    setResult(null);
    setRollState("idle");
  }

  const resultShowing = rollState === "result";
  const dimWhenResult = resultShowing
    ? "pointer-events-none opacity-30 transition-opacity duration-200"
    : "transition-opacity duration-200";

  return (
    <div className="flex min-h-dvh flex-col">
      <div className={dimWhenResult}>
        <TopBar
          left={<LeaveButton hash={hash} />}
          center={
            <button
              type="button"
              onClick={() => {
                setSettingsOpen(false);
                setEditOpen(true);
              }}
              className="truncate text-sm font-bold"
            >
              {name}
            </button>
          }
          right={
            <div className="relative">
              <SettingsButton onClick={() => setSettingsOpen(true)} />
              {settingsOpen && (
                <SettingsMenu
                  hash={hash}
                  mode={mode}
                  onModeChange={setMode}
                  modeChangeDisabled={rollState !== "idle"}
                  onDismiss={() => setSettingsOpen(false)}
                />
              )}
            </div>
          }
        />
      </div>

      <div className="relative mx-4 mt-[18px] flex-1">
        <DropArea
          dice={diceInstances
            // While the 3D physics dice are actively animating, hide their
            // flat sprites — they'd otherwise sit there showing stale
            // (previous-roll) faces underneath/around the real animation.
            // Coins have no 3D model at all, so their sprite always stays.
            .filter((die) => !(mode === "3d" && dice3DActive) || die.sides === 2)
            .map((die) => ({
              key: die.key,
              sides: die.sides,
              face: faces[die.key] ?? 1,
              settled: rollState !== "rolling" || settled[die.key] === true,
              tumble: tumble[die.key] ?? DIE_REST_TUMBLE,
            }))}
          color={currentPlayer?.color}
          blurred={resultShowing}
        />
        {mode === "3d" && <Dice3DArea ref={dice3DRef} active={dice3DActive} />}

        <div className={dimWhenResult}>
          <CurrentPlayerBadge
            player={currentPlayer}
            onClick={() => {
              setSettingsOpen(false);
              setEditPlayerOpen(true);
            }}
          />
        </div>

        <RollHistoryPill
          lastRoll={lastRoll}
          lastRollPlayer={lastRollPlayer}
          onClick={() => {
            setSettingsOpen(false);
            setHistoryOpen(true);
          }}
        />
        <NextPlayerPill disabled={rollState !== "idle" || players.length <= 1} onClick={handleNextPlayer} />

        <BottomBar
          active={activeDialog}
          onPlayers={goToPlayers}
          onHand={goToHand}
          disabled={rollState !== "idle"}
        />

        {resultShowing && result && (
          <ResultPopup
            playerName={result.playerName}
            playerColor={result.playerColor}
            dice={result.dice}
            sum={result.sum}
            avg={result.avg}
            median={result.median}
            min={result.min}
            max={result.max}
          />
        )}

        <RollButton
          disabled={(rollState !== "idle" && !resultShowing) || activeDialog === "hand" || !currentPlayer?.enabled}
          rolling={rollState === "rolling"}
          showResult={resultShowing}
          onClick={resultShowing ? handleDismissResult : handleRoll}
        />

        {activeDialog === "hand" && (
          <HandPane
            hand={hand}
            color={currentPlayer?.color}
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

@AGENTS.md

# web-roll-the-dice — project context

A mobile-friendly dice-rolling web app, built primarily for personal use (D&D / board game sessions) and shared as a public link from this public GitHub repo. Through phase06, developed in small, independent phases (`phaseNN` branches, tagged `phaseNN`); from v1.0.0 onward, releases are tagged `vX.Y.Z` (semantic versioning) directly on `main`. See [CHANGELOG.md](CHANGELOG.md) for the full release history and [README.md](README.md) for the original phase-by-phase summary.

## Confirmed architecture

- **Framework:** Next.js (App Router, TypeScript), deployed to Vercel (live since v1.0.0).
- **Styling:** Tailwind CSS v4, dark-only — a fixed "Midnight Arcade" palette (near-black radial-gradient background, cyan→violet gradient accents, Space Grotesk/Space Mono fonts) set as CSS custom properties in `globals.css` and exposed as `@theme` tokens; no light mode, no `prefers-color-scheme` (phase04). `globals.css` also flattens every CSS transition/animation duration under `@media (prefers-reduced-motion: reduce)` (phase05) — covers all incidental motion (dialogs, hover states, the 3D canvas's crossfade, ...) app-wide with no component changes; the roll animation itself is JS-driven and handled separately (see `src/lib/motion.ts`, `GameView.tsx`).
- **Icons:** `lucide-react`.
- **Sound:** Web Audio API (`src/lib/sound.ts`), no audio library. Real clips under `public/sounds/` for taps/rolls/fanfare, each with a synthesized (oscillator/noise-buffer) fallback if the file is missing — see "Sound system" below.
- **Database:** Postgres via **Drizzle ORM** (`drizzle-orm/node-postgres` + `pg`) — built, phase03. Local dev DB: Postgres 17 in Docker (`dice-pg`, `postgres:17`, password `dev`), reachable at `localhost:5432` from Windows directly (Docker Desktop bridges WSL2↔Windows `localhost`, so this isn't WSL-dependent). Migrations are generated with `npm run db:generate` and applied with `npm run db:migrate` (drizzle-kit; SQL files live in `drizzle/`). Production runs against a **Neon** Postgres 17 project (created phase06, live since v1.0.0) — same migrations applied against it with no code changes (`pg.Pool` works unchanged against Neon's connection string).
- **No multiplayer / no realtime.** The app is used by one person's browser at a time (a DM/host). "Players" are named entities within a game (name/color/icon/enabled), not authenticated identities — there's no per-player login.
- **Game access model (built):** a `game` has a 5-character hash (unambiguous alphabet, collision-checked on create) and an optional password (bcryptjs-hashed). Home page: hash input + "Join" (a single password field appears if the game is protected; repeat-password only appears on Create and on changing a password), and "Create game" (name + optional password, with repeat). A correct password grants a signed **iron-session** cookie (`src/lib/session.ts`) recording which game ids this browser has unlocked; `/g/[hash]` checks it server-side and redirects to `/?hash=...` if not unlocked, or `/?error=not-found` if the hash doesn't exist.
- **Data model (built):** see `src/lib/db/schema.ts`.
  - `games`: id, hash, name, password_hash?, created_at, last_modified, current_player_id (FK → players.id, circular reference resolved via drizzle-kit's generated `ALTER TABLE`), settings (jsonb — `mode: "2d" | "3d"`, the roll-mode setting, built phase05).
  - `players`: id, game_id, name, color, icon, enabled, current_hand (jsonb array of `HandEntry` — the same shape used for the live hand-of-dice state), order, created_at.
  - `rolls`: id, game_id (denormalized from player_id → game_id, kept to avoid a join for "all rolls in this game"), player_id, created_at, is_valid, data (jsonb: `sum`, `roll` (sides → values[]), `avg`, `median`, `min`, `max`).
- **Two roll modes, switchable per-game from the settings menu (`games.settings.mode`):**
  - **2D (built, phase02):** flat SVG sprites, results from `Math.random()`, tinted in the current player's color (phase03).
  - **3D (built, phase05, marked BETA):** `@3d-dice/dice-box` (Babylon.js + ammo.js physics, no React Three Fiber). The engine's own settled values are the real result — dice-box has no way to force/predetermine an outcome, so unlike 2D this mode's fairness depends on its physics, not `Math.random()`. Coins (d2) have no 3D model in any dice-box theme, so they always fall back to a flat-sprite flip animation regardless of mode. No server-authoritative requirement (not multiplayer) — the result is computed client-side, animated, shown, then persisted to roll history exactly like 2D.

## Current state (as of v1.0.1)

Full DB-backed games with players and roll history, restyled into the dark "Midnight Arcade" UI with animated dice and sound, plus an optional 3D physics roll mode. Routes: `/` (join/create) and `/g/[hash]` (the game itself). App icons use Next's file conventions: `src/app/icon.svg` (tab favicon) and `src/app/apple-icon.tsx` (a 180×180 PNG generated via `ImageResponse`, used for Android/iOS home-screen shortcuts) — there is deliberately no `favicon.ico`.

**Data / server layer:**
- `src/lib/db/schema.ts` / `client.ts` — Drizzle schema and the `pg`-backed client.
- `src/lib/db/games.ts`, `players.ts`, `rolls.ts` — query functions (find/create/update/delete, `reorderPlayers`, `updatePlayerHand`, `listRollsForGame`, `updateGameSettings`, ...).
- `src/lib/session.ts` — iron-session helpers (`isGameUnlocked`, `unlockGame`, `lockGame`).
- `src/lib/password.ts`, `src/lib/gameHash.ts` — bcryptjs wrappers and the 5-char hash generator.
- `src/lib/players.ts`, `src/lib/rolls.ts` — client-safe types/converters (`PlayerSummary`, `RollSummary`) plus `computeRollData()` (sum/avg/median/min/max from a set of rolled values) and `formatNumber()` — kept separate from `db/schema.ts` to avoid a client/server import cycle (schema.ts defines the DB-shape types like `RollData`, these files import them).
- `src/lib/playerColors.ts` — the 8-color/3-icon picker palette, `DEFAULT_PLAYER_COLOR` (neutral gray, outside the palette, for the first auto-created player), `pickRandomAvailableColor()`.
- `src/lib/dice.ts` — roll-timing and tumble math: `randomRollDuration`/`randomRevealDelay`, eased `tickIntervalForProgress`/`tumbleIntensityForProgress` (deceleration curves), `randomTumble()` (CSS translate/rotate offsets) — used by 2D mode, and by 3D mode's reduced-motion fallback.
- `src/lib/motion.ts` — `prefersReducedMotion()`, the one place the OS-level reduced-motion setting is read from JS (CSS-only motion is handled separately, see globals.css below).
- `src/types/dice-box.d.ts` — hand-written ambient types for `@3d-dice/dice-box` (it ships none); only covers the subset of its API `Dice3DArea.tsx` actually calls.
- `src/app/actions.ts` — every Server Action (join/create/update/delete/leave a game; add/update/reorder players, switch current player, persist a hand; record a roll, toggle its validity; `updateGameModeAction` for the 2D/3D setting).

**Home page** (`src/app/page.tsx` + `src/components/home/`) — `JoinForm` (hash → optional single password field, with Cancel) and `CreateGamePane` (name + password/repeat).

**Game page** (`src/app/g/[hash]/page.tsx` loads game+players+rolls server-side; `GameView.tsx` is the client shell):
- `src/components/layout/TopBar.tsx` (3 slots) and `BottomBar.tsx` (full-bleed Players/Hand nav, shared by the main screen and every dialog).
- `src/components/ui/DialogShell.tsx` — shared full-screen dialog chrome (same top/bottom bar as the main screen, a scrollable content panel, an optional contextual `addAction` pill, and a circular confirm FAB) used by every dialog pane; no open/close slide animation (tried and explicitly turned off).
- `src/components/game/LeaveButton.tsx`, `SettingsButton.tsx` + `SettingsMenu.tsx` — top-bar icons; the settings popover leads with a "Game options" item (opens `GameEditPane`, same as tapping the game name), then a "3D dice" `Switch` (BETA-badged, persisted server-side via `updateGameModeAction`) and a Sound on/off `Switch` (persisted to `localStorage`, `src/lib/sound.ts`'s `isMuted`/`setMuted`) above a separator, then Legend/Help/About. Both the mode switch and Next-player/Players/Hand nav disable for the whole `rollState !== "idle"` window (rolling through the result banner) — a roll (especially an in-flight 3D physics one) can't be cleanly cancelled mid-flight, so the escape hatch is blocked instead.
- `src/components/game/HelpPopup.tsx` — a short how-to-use reference (games, hands, rolling, players, 3D mode), sectioned and scrollable.
- `src/components/game/GameHashDialog.tsx`, `GameEditPane.tsx` — one-time hash reveal; rename/password-change/delete/leave.
- `src/components/game/CurrentPlayerBadge.tsx`, `PlayersPane.tsx`, `PlayerRow.tsx` (drag-sortable via `@dnd-kit`), `PlayerFormPane.tsx`, `NextPlayerPill.tsx` — player management and switching; `src/components/ui/Switch.tsx` is the shared toggle primitive (enabled-in-rotation, sound on/off).
- `src/components/game/RollHistoryPill.tsx`, `RollHistoryDialog.tsx`, `RollHistoryRow.tsx`, `RollStats.tsx` — footer pill + full history (expand-in-place, validity checkbox); `RollStats` (avg/median/min/max grid) is shared with the result banner.
- `src/components/dice/ResultPopup.tsx` — the post-roll result banner: full-width, vertically centered, blurs the drop area behind it, shows every die's real sprite plus `RollStats`; dismissed by its own OK or by the Next-player pill.
- `src/components/dice/DropArea.tsx` — renders the hand, each die's per-frame `tumble: {x, y, rot}` applied as an inline `transform` (decoupled from Tailwind's translate utilities) driven by `GameView`'s roll loop; `blurred` prop dims/blurs it while the result banner is open. Always the base layer regardless of mode — idle state, per-player resets, and coin rendering all live here, not duplicated in `Dice3DArea`.
- `src/components/dice/Dice3DArea.tsx` — a transient overlay on top of `DropArea`, faded in only while a 3D roll is actively animating (`active` prop) and faded back out at the exact moment the result banner appears, not before (so the swap back to flat sprites is covered by the banner, not a visible flash). Owns the `DiceBox` instance (dynamic-imported client-side only, lazily in a `useEffect`); exposes `roll(dice, color)` and `clear()` via `useImperativeHandle`. `GameView` calls `clear()` synchronously the instant Roll is pressed (not just once physics starts) so a second roll never briefly shows the previous roll's dice still sitting in their landed spots. `roll()` groups dice by `sides` (dice-box accepts multiple `{sides, qty}` groups in one call — tested with all 8 die types at once), and forces the container's canvas to actually fill its space via an injected CSS rule + `resizeWorld()` (the canvas otherwise silently sits at the browser's intrinsic 300×150 default, which was the root cause of an early "camera too far away" bug).
- `src/components/dice/RollButton.tsx` — the 168px circular FAB; swaps between "Roll!" (plays the roll/shake sound via `data-sound="roll"`) and "OK" once a result is showing (plain click sound — `data-sound` is only set while actually rolling).
- `src/components/ui/GlobalClickSound.tsx` — mounted once in `layout.tsx`; a single capturing `document` click listener plays a tap sound for every button app-wide, branching on a clicked button's `data-sound` (`"roll"` for the Roll FAB while idle, `"none"` to opt out, otherwise the default click) — the one delegated mechanism for click sound across the whole app.
- `src/components/dice/*` — `DieFace`/`NumberDieFace`/`CoinFace`/`DieSprite`/`HandPane`/`HandRow` all take an optional `color` prop (the current player's color; omitted in the Add Die/Legend previews, which stay neutral).
- `src/components/ui/ConfirmDialog.tsx`, `CopyButton.tsx`, `PasswordInput.tsx` — shared primitives (Yes/No confirm, clipboard copy, password show/hide toggle); `ConfirmDialog`/`LegendPopup`/`HelpPopup`/`AboutPopup` stay small centered popups, not `DialogShell`. All four are opened from inside `TopBar` (a `position:relative`, z-indexed `<header>`) and portal to `document.body` via `createPortal` for exactly that reason — a `position:fixed` modal nested inside a positioned, z-indexed ancestor has its stacking compared at the ancestor's rank, not its own, regardless of the modal's own z-index (phase06 fix).

`GameView.tsx` owns: player list + current player id, the active hand (loaded from/persisted to the current player's `current_hand` on Hand-pane close), the roll mode (`mode` state, seeded from the server, updated via `updateGameModeAction`), the roll state machine — 2D (`runRoll2D`, per-die self-scheduling `setTimeout` ticks with eased deceleration) and 3D (`runRoll3D`, awaits `Dice3DArea.roll()`, computes coin values itself since dice-box doesn't do coins) share a `finishRoll()` tail (build `RollData`, show the result, `playResultChime()`, `recordRollAction`) reached after a 250–500ms pause once every die has settled. Roll history is prepended locally the moment a roll finishes. `prefersReducedMotion()` is checked once per roll (in `handleRoll`, and again inside `runRoll2D`) — true forces the 2D flicker-only path even in 3D mode, and drops the tumble offsets, while keeping the same timing and sounds.

## Sound system

`src/lib/sound.ts` is the only place sound is produced. Every category (`playClick`, `playRollSound`, `playDiceClack`, `playResultChime`) tries real clips first — a small array of candidate filenames under `public/sounds/`, one is picked at random per call, decoded once via `AudioContext.decodeAudioData` and cached by URL — and falls back automatically to a synthesized version (oscillators/noise buffers) if the array is empty or a clip fails to load, so the app never goes silent for a missing file. Dice-roll clips additionally get a per-die-size `playbackRate` range (`CLACK_PITCH`) with random jitter, so different dice (and repeated ticks of the same die) don't sound identical. A module-level `muted` flag (backed by `localStorage["dice-app-muted"]`) gates every exported `play*` function; toggle it from the Sound switch in `SettingsMenu`. Adding a new clip is just adding its filename to the relevant array — no other wiring needed.

## Dev environment notes

- Node.js LTS installed via `winget install OpenJS.NodeJS.LTS` directly on Windows (not WSL, not containerized) — deliberate choice to keep things simple; revisit only if a second Node version is ever needed.
- **PATH gotcha:** if Node was just installed in a shell/tooling session that was already running, that session's PATH won't see `node`/`npm` until it's refreshed. In PowerShell:
  ```powershell
  $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
  ```
  The Browser-pane dev server preview (`.claude/launch.json`) points at `.claude/dev.cmd`, a wrapper that prepends `C:\Program Files\nodejs` to PATH before running `npm run dev`, for the same reason. A fresh terminal the user opens themselves doesn't need any of this — PATH is already correct system-wide.
- **Env vars:** `.env` (gitignored) holds `DATABASE_URL` and `SESSION_SECRET`; `.env.example` is the committed template (`.gitignore` has a `!.env.example` exception to the blanket `.env*` ignore). Both Next.js and drizzle-kit read plain `.env` automatically, which is why `.env` was used instead of `.env.local`.
- Local Postgres: `docker run --name dice-pg -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:17`. After a schema change: `npm run db:generate` then `npm run db:migrate`. `npm run db:studio` opens Drizzle Studio for poking at the data directly.

## Conventions

- Feature components live under `src/components/<feature>/` (e.g. `src/components/dice/`, `src/components/game/`).
- Shared, non-component logic goes in `src/lib/`; DB-specific code goes in `src/lib/db/`.
- Keep `"use client"` on the top-level component that owns interactive state (e.g. `page.tsx`, `GameView.tsx`); presentational subcomponents stay plain function components.
- A `.$type<T>()` jsonb column's shape (`GameSettings`, `RollData`, `HandEntry[]`) is defined once in `db/schema.ts` and re-exported (not redefined) from the relevant pure `lib/*.ts` module, to avoid a schema.ts ↔ lib import cycle — see `lib/players.ts`/`lib/rolls.ts` for the pattern.
- Buttons get their click sound for free from `GlobalClickSound`'s document-level listener — don't add per-button sound-playing code. Opt into a different sound with `data-sound="roll"`, or opt out with `data-sound="none"`, only when a button's sound genuinely differs from the default tap.

## Release workflow

`main` is production — Vercel auto-deploys every push to it, so nothing is committed to it directly anymore. Instead: do all work on `dev` (or a short-lived feature branch merged into `dev`), and get it tested there — Vercel gives every branch/PR its own preview deployment automatically, no config needed. When it's ready to ship, still on `dev`: update CHANGELOG.md and this file, and bump the version in lockstep in both `package.json` and `src/lib/version.ts`'s `APP_VERSION` (shown in the About popup). Open the PR into `main`; once merged, tag `vX.Y.Z` (annotated, on `main` — tagging doesn't add a commit, so this is fine directly on `main`). Bump **patch** for fixes, **minor** for new features, **major** for breaking changes or a significant redesign. (README's phase-by-phase list is a historical record through phase06 and isn't extended for new releases — CHANGELOG.md is the authoritative release log from v1.0.0 on.)

## Roadmap (not yet built)

Nothing currently planned — v1.0.0 is live on Vercel + Neon.

## Resolved decisions

- **Coins (d2) stay mixable with other die types in the same hand, permanently — not planned as a future "split" feature.** Raised during phase05 (3D mode gives coins fundamentally different treatment — their own flip animation, sound, and visibility rules, since they have no 3D model at all) as "should selecting a coin exclude other die types?" No real tabletop scenario was found that needs the exclusivity, and the code already treats coins distinctly wherever it actually matters; adding a hand-composition restriction on top would be complexity with no concrete use case behind it.
- **`phase06` was the last phase-numbered release.** The `phaseNN` branch/tag/`APP_VERSION` scheme was a deliberate fit for this project's original small-learning-iteration development style, but doesn't fit a public app with real users. `v1.0.0` switches to semantic versioning (major.minor.patch) instead, tagged directly on `main` (no more per-release branches) — see "Release workflow" above.

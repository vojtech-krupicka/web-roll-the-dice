@AGENTS.md

# web-roll-the-dice — project context

A mobile-friendly dice-rolling web app, built primarily for personal use (D&D / board game sessions) and shared as a public link from this public GitHub repo. Developed in small, independent phases — each phase gets its own branch (`phaseNN`), is merged to `main`, tagged `phaseNN`, and logged in [CHANGELOG.md](CHANGELOG.md). See [README.md](README.md) for the phase-by-phase summary.

## Confirmed architecture

- **Framework:** Next.js (App Router, TypeScript), deployed to Vercel eventually (not yet deployed).
- **Styling:** Tailwind CSS v4, dark-only — a fixed "Midnight Arcade" palette (near-black radial-gradient background, cyan→violet gradient accents, Space Grotesk/Space Mono fonts) set as CSS custom properties in `globals.css` and exposed as `@theme` tokens; no light mode, no `prefers-color-scheme` (phase04).
- **Icons:** `lucide-react`.
- **Sound:** Web Audio API (`src/lib/sound.ts`), no audio library. Real clips under `public/sounds/` for taps/rolls/fanfare, each with a synthesized (oscillator/noise-buffer) fallback if the file is missing — see "Sound system" below.
- **Database:** Postgres via **Drizzle ORM** (`drizzle-orm/node-postgres` + `pg`) — built, phase03. Local dev DB: Postgres 17 in Docker (`dice-pg`, `postgres:17`, password `dev`), reachable at `localhost:5432` from Windows directly (Docker Desktop bridges WSL2↔Windows `localhost`, so this isn't WSL-dependent). Migrations are generated with `npm run db:generate` and applied with `npm run db:migrate` (drizzle-kit; SQL files live in `drizzle/`). Eventually swaps to Neon for production.
- **No multiplayer / no realtime.** The app is used by one person's browser at a time (a DM/host). "Players" are named entities within a game (name/color/icon/enabled), not authenticated identities — there's no per-player login.
- **Game access model (built):** a `game` has a 5-character hash (unambiguous alphabet, collision-checked on create) and an optional password (bcryptjs-hashed). Home page: hash input + "Join" (a single password field appears if the game is protected; repeat-password only appears on Create and on changing a password), and "Create game" (name + optional password, with repeat). A correct password grants a signed **iron-session** cookie (`src/lib/session.ts`) recording which game ids this browser has unlocked; `/g/[hash]` checks it server-side and redirects to `/?hash=...` if not unlocked, or `/?error=not-found` if the hash doesn't exist.
- **Data model (built):** see `src/lib/db/schema.ts`.
  - `games`: id, hash, name, password_hash?, created_at, last_modified, current_player_id (FK → players.id, circular reference resolved via drizzle-kit's generated `ALTER TABLE`), settings (jsonb, currently just a `mode` placeholder for 2D/3D).
  - `players`: id, game_id, name, color, icon, enabled, current_hand (jsonb array of `HandEntry` — the same shape used for the live hand-of-dice state), order, created_at.
  - `rolls`: id, game_id (denormalized from player_id → game_id, kept to avoid a join for "all rolls in this game"), player_id, created_at, is_valid, data (jsonb: `sum`, `roll` (sides → values[]), `avg`, `median`, `min`, `max`).
- **Two roll modes:**
  - **2D (built, phase02):** flat SVG sprites, results from `Math.random()`, tinted in the current player's color (phase03).
  - **3D (planned):** `@react-three/fiber` + `@react-three/rapier` (or `@3d-dice/dice-box`) physics sim. Since this isn't multiplayer, there's no server-authoritative requirement — the result can be computed client-side however is convenient, animated, shown, then persisted to roll history.

## Current state (as of phase04)

Full DB-backed games with players and roll history, restyled into the dark "Midnight Arcade" UI with animated dice and sound. Routes: `/` (join/create) and `/g/[hash]` (the game itself).

**Data / server layer:**
- `src/lib/db/schema.ts` / `client.ts` — Drizzle schema and the `pg`-backed client.
- `src/lib/db/games.ts`, `players.ts`, `rolls.ts` — query functions (find/create/update/delete, `reorderPlayers`, `updatePlayerHand`, `listRollsForGame`, ...).
- `src/lib/session.ts` — iron-session helpers (`isGameUnlocked`, `unlockGame`, `lockGame`).
- `src/lib/password.ts`, `src/lib/gameHash.ts` — bcryptjs wrappers and the 5-char hash generator.
- `src/lib/players.ts`, `src/lib/rolls.ts` — client-safe types/converters (`PlayerSummary`, `RollSummary`) plus `computeRollData()` (sum/avg/median/min/max from a set of rolled values) and `formatNumber()` — kept separate from `db/schema.ts` to avoid a client/server import cycle (schema.ts defines the DB-shape types like `RollData`, these files import them).
- `src/lib/playerColors.ts` — the 8-color/3-icon picker palette, `DEFAULT_PLAYER_COLOR` (neutral gray, outside the palette, for the first auto-created player), `pickRandomAvailableColor()`.
- `src/lib/dice.ts` — roll-timing and tumble math: `randomRollDuration`/`randomRevealDelay`, eased `tickIntervalForProgress`/`tumbleIntensityForProgress` (deceleration curves), `randomTumble()` (CSS translate/rotate offsets).
- `src/app/actions.ts` — every Server Action (join/create/update/delete/leave a game; add/update/reorder players, switch current player, persist a hand; record a roll, toggle its validity).

**Home page** (`src/app/page.tsx` + `src/components/home/`) — `JoinForm` (hash → optional single password field, with Cancel) and `CreateGamePane` (name + password/repeat).

**Game page** (`src/app/g/[hash]/page.tsx` loads game+players+rolls server-side; `GameView.tsx` is the client shell):
- `src/components/layout/TopBar.tsx` (3 slots) and `BottomBar.tsx` (full-bleed Players/Hand nav, shared by the main screen and every dialog).
- `src/components/ui/DialogShell.tsx` — shared full-screen dialog chrome (same top/bottom bar as the main screen, a scrollable content panel, an optional contextual `addAction` pill, and a circular confirm FAB) used by every dialog pane; no open/close slide animation (tried and explicitly turned off).
- `src/components/game/LeaveButton.tsx`, `SettingsButton.tsx` + `SettingsMenu.tsx` — top-bar icons; the settings popover holds a Sound on/off `Switch` (persisted to `localStorage`, `src/lib/sound.ts`'s `isMuted`/`setMuted`) above a separator, then Legend/About.
- `src/components/game/GameHashDialog.tsx`, `GameEditPane.tsx` — one-time hash reveal; rename/password-change/delete/leave.
- `src/components/game/CurrentPlayerBadge.tsx`, `PlayersPane.tsx`, `PlayerRow.tsx` (drag-sortable via `@dnd-kit`), `PlayerFormPane.tsx`, `NextPlayerPill.tsx` — player management and switching; `src/components/ui/Switch.tsx` is the shared toggle primitive (enabled-in-rotation, sound on/off).
- `src/components/game/RollHistoryPill.tsx`, `RollHistoryDialog.tsx`, `RollHistoryRow.tsx`, `RollStats.tsx` — footer pill + full history (expand-in-place, validity checkbox); `RollStats` (avg/median/min/max grid) is shared with the result banner.
- `src/components/dice/ResultPopup.tsx` — the post-roll result banner: full-width, vertically centered, blurs the drop area behind it, shows every die's real sprite plus `RollStats`; dismissed by its own OK or by the Next-player pill.
- `src/components/dice/DropArea.tsx` — renders the hand, each die's per-frame `tumble: {x, y, rot}` applied as an inline `transform` (decoupled from Tailwind's translate utilities) driven by `GameView`'s roll loop; `blurred` prop dims/blurs it while the result banner is open.
- `src/components/dice/RollButton.tsx` — the 168px circular FAB; swaps between "Roll!" (plays the roll/shake sound via `data-sound="roll"`) and "OK" once a result is showing (plain click sound — `data-sound` is only set while actually rolling).
- `src/components/ui/GlobalClickSound.tsx` — mounted once in `layout.tsx`; a single capturing `document` click listener plays a tap sound for every button app-wide, branching on a clicked button's `data-sound` (`"roll"` for the Roll FAB while idle, `"none"` to opt out, otherwise the default click) — the one delegated mechanism for click sound across the whole app.
- `src/components/dice/*` — `DieFace`/`NumberDieFace`/`CoinFace`/`DieSprite`/`HandPane`/`HandRow` all take an optional `color` prop (the current player's color; omitted in the Add Die/Legend previews, which stay neutral).
- `src/components/ui/ConfirmDialog.tsx`, `CopyButton.tsx`, `PasswordInput.tsx` — shared primitives (Yes/No confirm, clipboard copy, password show/hide toggle); `ConfirmDialog`/`LegendPopup`/`AboutPopup` stay small centered popups, not `DialogShell`.

`GameView.tsx` owns: player list + current player id, the active hand (loaded from/persisted to the current player's `current_hand` on Hand-pane close), the roll state machine (per-die self-scheduling `setTimeout` ticks with eased deceleration, a 250–500ms pause after the last die settles before the result reveals, then a fanfare via `playResultChime()`), and roll history (prepended locally the moment a roll finishes, persisted via `recordRollAction`).

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

Each phase: branch `phaseNN` off `main` → implement → update README's phase list, CHANGELOG.md, and this file → merge to `main` → tag `phaseNN` (annotated) on `main`.

## Roadmap (not yet built)

1. 3D physics roll mode.
2. Deploy to Vercel + swap local Postgres for Neon.

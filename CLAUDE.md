@AGENTS.md

# web-roll-the-dice — project context

A mobile-friendly dice-rolling web app, built primarily for personal use (D&D / board game sessions) and shared as a public link from this public GitHub repo. Developed in small, independent phases — each phase gets its own branch (`phaseNN`), is merged to `main`, tagged `phaseNN`, and logged in [CHANGELOG.md](CHANGELOG.md). See [README.md](README.md) for the phase-by-phase summary.

## Confirmed architecture

- **Framework:** Next.js (App Router, TypeScript), deployed to Vercel eventually (not yet deployed).
- **Styling:** Tailwind CSS v4, light/dark via `prefers-color-scheme`.
- **Icons:** `lucide-react`.
- **Database:** Postgres (Neon, serverless-friendly) via **Drizzle ORM** — not started yet (planned from phase 03+). Local dev DB: Postgres 17 in Docker, reachable at `localhost:5432` (works from Windows directly; Docker Desktop bridges WSL2↔Windows `localhost`, so this isn't WSL-dependent).
- **No multiplayer / no realtime / no user accounts.** The app is used by one person at a time (a DM/host). "Players" are just names attached to a game's hands and roll history, not authenticated identities.
- **Game access model (planned):** a `game` is identified by a short random hash (5 chars, unambiguous alphabet, collision-checked) and can optionally have a password. Main page: hash input + "Join game", and a "Create game" button (settings incl. optional password) → returns the new hash. Password verified server-side, grants a signed **iron-session** cookie scoped to that game.
- **Data model (planned):** `games` (id, hash, name, password_hash?, default_mode, created_at) · `players` (id, game_id, name) · `rolls` (id, game_id, player_id, dice jsonb, results jsonb, total, mode, created_at).
- **Two roll modes:**
  - **2D (built, phase02):** flat SVG sprites, results from `Math.random()` — see below.
  - **3D (planned):** `@react-three/fiber` + `@react-three/rapier` (or `@3d-dice/dice-box`) physics sim. Since this isn't multiplayer, there's no server-authoritative requirement — the result can be computed client-side however is convenient, animated, shown, then persisted to roll history.

## Current state (as of phase02)

A local, client-side "hand of dice" builder and roller — no DB, no games/players, no routing beyond `/`:

- `src/app/page.tsx` — owns both the hand state (`HandEntry[]`) and the roll state machine (`idle → rolling → result → idle`). Each die in the hand animates on its own random duration (`randomRollDuration()`, 0.5–2s) via independent interval/timeout pairs tracked in a ref; the result is only shown once every die has settled.
- `src/lib/hand.ts` — `HandEntry`/`DieSides` model (`DIE_TYPES` = 2/4/6/8/10/12/20/100), `activeDiceCount`, `pruneEmptyEnabledEntries`, `flattenHand`.
- `src/lib/dice.ts` — `rollDie(sides)` (d2 special-cased to 0/1), `randomRollDuration()`, tick/duration constants.
- `src/components/layout/TopBar.tsx` — header with a slot for the Hand toggle (left side still empty, reserved for later).
- `src/components/dice/HandToggleButton.tsx` / `HandPane.tsx` / `HandRow.tsx` / `AddDiePopup.tsx` — the hand-editing UI: an overlay pane with one row per die type and a 2×4 "Add die" grid.
- `src/components/dice/DieSprite.tsx` — dispatches to `DieFace` (pip d6), `CoinFace` (d2), or `NumberDieFace` (d4/d8/d10/d12/d20/d100 — triangle/diamond/kite/pentagon/hexagon/octagon, all in the same neutral palette) by `sides`.
- `src/components/dice/DropArea.tsx` — renders every die in the hand with a small type label above each. `RollButton.tsx` / `ResultPopup.tsx` unchanged in shape from phase01.

## Dev environment notes

- Node.js LTS installed via `winget install OpenJS.NodeJS.LTS` directly on Windows (not WSL, not containerized) — deliberate choice to keep things simple; revisit only if a second Node version is ever needed.
- **PATH gotcha:** if Node was just installed in a shell/tooling session that was already running, that session's PATH won't see `node`/`npm` until it's refreshed. In PowerShell:
  ```powershell
  $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
  ```
  The Browser-pane dev server preview (`.claude/launch.json`) points at `.claude/dev.cmd`, a wrapper that prepends `C:\Program Files\nodejs` to PATH before running `npm run dev`, for the same reason. A fresh terminal the user opens themselves doesn't need any of this — PATH is already correct system-wide.

## Conventions

- Feature components live under `src/components/<feature>/` (e.g. `src/components/dice/`).
- Shared, non-component logic goes in `src/lib/`.
- Keep `"use client"` on the top-level component that owns interactive state (e.g. `page.tsx`); presentational subcomponents stay plain function components.

## Release workflow

Each phase: branch `phaseNN` off `main` → implement → update README's phase list, CHANGELOG.md, and this file → merge to `main` → tag `phaseNN` (annotated) on `main`.

## Roadmap (not yet built)

1. Postgres + Drizzle schema (`games`/`players`/`rolls`), local Docker Postgres.
2. Create/Join game flow (hash + optional password) + iron-session.
3. Player management within a game + roll persistence/history.
4. 3D physics roll mode.
5. Deploy to Vercel + swap local Postgres for Neon.

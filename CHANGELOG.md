# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Instead of semantic versioning, releases here are tagged by development phase (`phase01`, `phase02`, ...) — each one a self-contained learning iteration.

## [Unreleased]

## [phase04] - 2026-09-14

### Added

- Full "Midnight Arcade" visual redesign: fixed dark theme (light mode dropped), cyan→violet gradient accents, Space Grotesk/Space Mono fonts, a large circular Roll button overflowing the bottom edge, edge-docked pills for the last roll and next player
- A shared `DialogShell` (top/bottom bar, scrollable content, circular confirm FAB, optional "Add" action) and `BottomBar` (Players/Hand nav) used by the main screen and every dialog pane, replacing each dialog's own hand-rolled overlay
- CSS tumble animation for rolling dice — movement and rotation across the drop area with genuine deceleration (position, rotation, and face-value flicker all ease to a stop) as each die settles, plus a short pause after the last die lands before the result reveals
- Result reveal redesigned into a full-width banner: real die sprites at size/shape/color, the total, and an avg/median/min/max stat row (`RollStats`, shared with the roll-history row); blurs the drop area behind it while staying dismissible via its own OK or the next-player pill, with the roll-history and next-player pills still live
- Sound effects via the Web Audio API (`src/lib/sound.ts`): a tap sound on every button, a distinct roll-press sound, per-die tumble/landing sounds (randomized per press/die, with per-die-size pitch variation), and a fanfare on the result reveal — real audio clips under `public/sounds/`, each with a synthesized fallback if the file is missing
- A Sound on/off switch at the top of the settings menu, persisted to `localStorage`

### Changed

- Roll button doubles as the OK button once a result is showing; pressing it now plays the normal click sound instead of the roll sound (only an actual roll press does)
- Every dialog's confirm FAB plays the normal click sound instead of the roll sound

### Fixed

- Bottom bar disappearing (and its buttons becoming unusable) while the result banner is showing
- The last-roll pill painting above the Roll button when a player's name is long
- Opening a dialog sliding the whole screen, including a duplicate bottom bar, instead of just the dialog's own content (the slide animation was ultimately removed entirely)

## [phase03] - 2026-09-13

### Added

- Postgres persistence (Drizzle ORM): `games`, `players`, and `rolls` tables, migrated with drizzle-kit
- Home page rebuilt as a join/create screen: join an existing game by its 5-character hash (protected games prompt once for a password, with Cancel to back out), or create a new game (name + optional password)
- Password-protected games are gated by a signed iron-session cookie; a "here's your hash" dialog appears once after joining/creating
- Game top bar: a Settings menu (Leave game / Legend / About, anchored under the cog button) and a clickable game name opening rename, password-change, delete-game (password + confirmation), and leave-game controls
- Multiple players per game, each with a name, a color (8-color palette, randomly assigned and kept distinct across players; the first auto-created player gets a neutral gray outside that palette), an icon, and an enabled flag; a Players pane lists them with drag-to-reorder
- A player bar shows the current player and opens the Players pane; "Next player" (confirmed) cycles forward, picking a specific player from the pane (also confirmed) is the only way to go backward
- Each player's hand is now saved separately and restored when switching to them; dice are tinted in the current player's color throughout
- Roll history: every roll is recorded with its sum, per-die breakdown, average, median, min, and max; a footer bar shows the latest roll and opens the full history, where a checkbox marks a roll invalid (grayed out, struck through) without deleting it

## [phase02] - 2026-09-11

### Added

- Top bar with a "Hand" toggle button that opens/closes the Hand pane
- Hand pane: one row per die type (enable checkbox, shape icon, minus/count/plus), plus an "Add die" popup listing all 8 types (d4/d6/d8/d10/d12/d20/d100 and a d2 coin flip) in a 2x4 grid, disabling types already in the hand
- Drop area now renders every die in the hand, each labeled with its type, instead of a single fixed d6
- Distinct 2D shape per die type (triangle, diamond, kite, pentagon, hexagon, octagon, plus the existing pip d6 and a coin) so a mixed hand is readable at a glance
- Rolling now covers the whole hand: each die animates for an independent random duration (0.5-2s) and settles on its own; the result popup shows the sum once every die has stopped

### Changed

- Unchecking a die type in the hand only excludes it from rolls; its count is preserved and restored when re-enabled (previously reset to zero)
- Newly added die types start at count 1 instead of 0

## [phase01] - 2026-09-11

### Added

- Next.js app scaffold (App Router, TypeScript, Tailwind v4, ESLint)
- Drop area displaying a single d6 face as an SVG pip sprite
- Roll button with a ~500ms random face-swap animation, settling on a `Math.random()` result
- Result popup shown in front of the Roll button; dismissible with any click, which re-enables the button

[Unreleased]: https://github.com/vojtech-krupicka/web-roll-the-dice/compare/phase04...HEAD
[phase04]: https://github.com/vojtech-krupicka/web-roll-the-dice/releases/tag/phase04
[phase03]: https://github.com/vojtech-krupicka/web-roll-the-dice/releases/tag/phase03
[phase02]: https://github.com/vojtech-krupicka/web-roll-the-dice/releases/tag/phase02
[phase01]: https://github.com/vojtech-krupicka/web-roll-the-dice/releases/tag/phase01

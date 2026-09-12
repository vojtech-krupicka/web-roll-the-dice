# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Instead of semantic versioning, releases here are tagged by development phase (`phase01`, `phase02`, ...) — each one a self-contained learning iteration.

## [Unreleased]

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

[Unreleased]: https://github.com/vojtech-krupicka/web-roll-the-dice/compare/phase03...HEAD
[phase03]: https://github.com/vojtech-krupicka/web-roll-the-dice/releases/tag/phase03
[phase02]: https://github.com/vojtech-krupicka/web-roll-the-dice/releases/tag/phase02
[phase01]: https://github.com/vojtech-krupicka/web-roll-the-dice/releases/tag/phase01

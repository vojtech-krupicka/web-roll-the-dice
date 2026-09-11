# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Instead of semantic versioning, releases here are tagged by development phase (`phase01`, `phase02`, ...) — each one a self-contained learning iteration.

## [Unreleased]

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

[Unreleased]: https://github.com/vojtech-krupicka/web-roll-the-dice/compare/phase02...HEAD
[phase02]: https://github.com/vojtech-krupicka/web-roll-the-dice/releases/tag/phase02
[phase01]: https://github.com/vojtech-krupicka/web-roll-the-dice/releases/tag/phase01

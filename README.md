# web-roll-the-dice

A simple, mobile-friendly web app for rolling multiple dice and playing small tabletop-style games around them.

Built in short, incremental phases — see [CHANGELOG.md](CHANGELOG.md) for the full history and [CLAUDE.md](CLAUDE.md) for the current architecture and project state.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) for icons
- Postgres + [Drizzle ORM](https://orm.drizzle.team/)
- [iron-session](https://github.com/vvo/iron-session) (game passwords) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (password hashing)
- [@dnd-kit](https://dndkit.com/) (drag-to-reorder players)

## Getting started

Requires [Node.js](https://nodejs.org/) (LTS) and a local Postgres instance.

```bash
# Postgres (once)
docker run --name dice-pg -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:17

# App
cp .env.example .env   # fill in DATABASE_URL / SESSION_SECRET
npm install
npm run db:migrate
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Development phases

Each phase is a small, self-contained iteration, merged to `main` and tagged on its own.

### Phase 01 — Single d6 roller

- Next.js project scaffold (App Router, TypeScript, Tailwind v4, ESLint)
- One screen: a drop area showing a single d6, and a "Roll the dice" button
- Rolling briefly animates through random faces (~500ms), then settles on a `Math.random()` result
- Result shown in a popup in front of the button; dismissible with any click, ready to roll again
- No persistence or multiplayer yet — purely local, client-side state

### Phase 02 — A hand of dice

- Top bar with a "Hand" toggle button (dice icon; label hidden on mobile)
- Hand pane for building a custom hand: each die type gets a row with an enable checkbox, its shape icon, and minus/count/plus controls
- "Add die" popup — a 2×4 grid of every type (d4/d6/d8/d10/d12/d20/d100 plus a d2 coin flip), already-added types shown disabled; picking one adds it to the hand at count 1
- Disabling a type only excludes it from rolls — its count is preserved and restored when re-enabled; closing the pane with zero active dice is blocked with an inline error, and enabled types left at zero are dropped
- Drop area renders every die in the hand, each labeled with its type, instead of just one d6
- Distinct shape per die type (pip d6, coin, triangle/diamond/kite/pentagon/hexagon/octagon) so a mixed hand is recognizable at a glance
- Rolling covers the whole hand: each die animates for its own random duration (0.5–2s) and settles independently; the result popup shows the total once every die has stopped

### Phase 03 — Games, players, and roll history

- Everything now persists to Postgres: games, players, and every roll
- Main page: join a game by its 5-character hash (protected games prompt once for a password), or create a new one (name + optional password)
- A game's top bar gains a Settings menu (Leave game / Legend / About) and a clickable name opening rename, password-change, delete, and leave controls
- Multiple players per game: add/edit with a name, a color (auto-distinct, randomly assigned, from a curated palette), and an icon; drag to reorder; enable/disable a player
- A player bar under the top bar shows who's active and opens the player list; switching players (via "Next player" or picking one from the list, both confirmed) swaps in that player's own saved hand and tints the dice in their color
- A footer bar shows the latest roll and opens the full roll history — every roll's sum, per-die breakdown, average, median, min, and max, with a checkbox to mark a roll invalid without deleting it

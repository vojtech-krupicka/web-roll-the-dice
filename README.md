# web-roll-the-dice

A simple, mobile-friendly web app for rolling multiple dice and playing small tabletop-style games around them.

Built in short, incremental phases — see [CHANGELOG.md](CHANGELOG.md) for the full history and [CLAUDE.md](CLAUDE.md) for the current architecture and project state.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) for icons
- Postgres + [Drizzle ORM](https://orm.drizzle.team/) (planned, from phase 02 onward)

## Getting started

Requires [Node.js](https://nodejs.org/) (LTS).

```bash
npm install
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

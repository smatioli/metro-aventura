# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Estação de Jogos** ("Games Station") is a portal of simple, accessible browser games in Portuguese (pt-BR). It's a static TypeScript/Vite site with no backend, no framework (no React/Vue), and no database — just DOM manipulation via `innerHTML` templates.

The flagship game, **Metrô Aventura**, was built for a 7-year-old autistic child who cannot yet read but can use a mouse, arrow keys, space, letters and numbers. This origin drives real design constraints documented in `docs/adr/` and `context.md` — read those before changing gameplay, controls, or pacing in that game. Two more games (**Quem é Quem**, **Sílabas**) share the same low-stimulation, non-punitive philosophy but are simpler quiz-style experiences.

## Commands

```bash
npm install       # install dependencies (Node 22, see .nvmrc)
npm run dev       # start Vite dev server (usually http://localhost:5173)
npm test          # run all tests once (vitest run)
npm run build     # tsc typecheck + vite build -> dist/
```

- There is no lint script and no single-test CLI shortcut configured; run `npm test` (Vitest picks up `*.test.ts` files under `src/`) or use `npx vitest run <path>` / `npx vitest <path>` to target one file.
- `dist/` is generated and gitignored — never edit or commit it.
- Deployment is Netlify (`netlify.toml`): build command `npm run build`, publish dir `dist`, SPA-style catch-all redirect to `/index.html`.

## Architecture

### Routing: one entry point, path-based dynamic import

`src/main.ts` is the single script loaded by `index.html`. It inspects `window.location.pathname` and dynamically imports exactly one game module (or the portal) based on an exact path match (`/metro-aventura`, `/quem-e-quem`, `/silabas`, else the portal at `/`). There is no router library and no shared layout — each game/portal module owns its entire `#app` subtree and injects its own `<style>` via a colocated `style.css` import.

Because routing is exact-string matching (not prefix matching), a new game needs a new `else if` branch in `src/main.ts` plus a card in `src/portal/main.ts`, and Netlify's catch-all redirect (`/* -> /index.html`) is what makes deep links like `/silabas/` resolve to this same entry point.

### Per-game module layout

Each game lives under `src/games/<name>/` and is self-contained:
- `main.ts` — screens, state (module-level `let` variables, not a framework store), event wiring, and HTML template strings rendered via `app.innerHTML`.
- `data.ts` — static content/config for the game (stations, lines, fleets, presenters, syllable sets), kept separate from game logic so content can change without touching rules.
- `style.css` — scoped by convention to that game's markup.
- `*.test.ts` — Vitest unit tests, colocated with the module under test.

Static assets (images/audio) live under `public/games/<name>/...` and are served at `/games/<name>/...`, matching the Netlify cache-control rule for `/games/*/img/*`.

### Metrô Aventura specifics

This is the most complex game and has the most invariants to preserve:

- **Flow**: empresa (company) → linha (line) → frota (fleet) → sentido (direction) → viagem (journey), enforced end-to-end — see `docs/adr/0001`, `0008`, `0011`, `0012`.
- **Data model** (`src/games/metro-aventura/data.ts`): `companies`, `lines` (each with `stations: string[]` in real geographic order and a `fleets: FleetId[]` compatibility list), and `cptmFleetMatrix`. The line↔fleet matrix is treated as authoritative per `docs/adr/0015` — it was defined by the project owner and may intentionally diverge from real-world operational data (e.g. CPTM lines 8/9 are merged into one "CPTM" choice in-game).
- **Pure logic** (`src/games/metro-aventura/game-state.ts`): screen/phase/view state machine helpers, route direction, speed curve, and key-pool selection — kept free of DOM code so it's directly unit-testable (`game-state.test.ts`).
- **Platform sides**: `platformSides` in `data.ts` maps each station to `"left"` or `"right"` for door-opening visuals. New CPTM stations default to `"right"`; correct manually per the real platform when known. Always update this when adding/renaming stations.
- **Autosave**: after each completed station, progress (line, direction, fleet, station index) is written to `localStorage` under `SAVE_KEY` (`game-state.ts`) so a trip can resume from the portal — see `docs/adr/0014`.
- **Views**: three camera perspectives (`side`, `interior`, `cab`) cycle via `nextView`; the camera is locked to `side` during door operation at a station (`docs/adr/0007`).
- **Accessibility/pacing invariants** (do not violate without an explicit ADR-worthy decision): no losing state, no timers/penalties, every instruction must be conveyable without requiring reading (visual key demonstrations first, text/audio as a supplement), voice announcements use the Web Speech API at reduced rate, sounds are synthesized via the Web Audio API (`train-audio.ts`) and everything must remain usable with audio off.
- `context.md` describes this design in prose detail but predates the multi-game restructuring — its file paths (`src/data.ts`, `src/main.ts`, etc.) are stale; treat it as background/rationale, and trust the current `src/games/metro-aventura/` layout for actual paths.
- `docs/adr/*.md` are numbered, dated decision records — check for an existing ADR before changing core rules (route direction, controls, camera behavior, save format), and add a new one for comparable decisions rather than editing history.
- `docs/station-catalog.md` and `docs/fleet-catalog.md` are human-readable catalogs that should stay in sync when stations or fleets change.

### Quem é Quem and Sílabas

Simpler quiz loops (module-level state machine, no persistence): pick a prompt, render options, speak the question via `speechSynthesis`, check the answer, advance after a delay. `silabas/data.ts` holds its content data.

`quem-e-quem/` is a small hub: a topic-select screen lets the player pick between two datasets that share one generic engine (`main.ts`) — **Jornalistas** (presenter ↔ show) and **Jogadores e Times** (player ↔ team). `types.ts` defines the shared `Person`/`Topic` shapes, `jornalistas-data.ts` and `jogadores-data.ts` hold each topic's content, and `topics.ts` wires them into the `Topic` configs (question templates, copy, accent color) the engine renders generically. Player photos live under `public/games/jogadores/fotos/`; a person's `group` with no `groupLogo` renders as a text badge instead of an image. `jornais_e_jornalistas.md` in that folder is reference/content notes, not code.

## Conventions to follow

- All user-facing strings are Portuguese (pt-BR); keep new copy consistent with that.
- Keep content data (`data.ts`) separate from behavior (`main.ts`/`game-state.ts`) in each game — this split is intentional per `docs/adr/0012`.
- Update the relevant `*.test.ts` and `docs/*catalog.md` files when changing stations, lines, or fleets in Metrô Aventura.
- Run `npm test` and `npm run build` before considering a change to Metrô Aventura done (build runs `tsc` with `strict: true`).

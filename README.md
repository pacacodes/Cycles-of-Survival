# ELPACA — Cycles of Survival (Board/Card Game)

This branch pivots ELPACA from a web app into a tooling repo for a physical board/card game: Cycles of Survival. It now provides Node-based generators to produce print-ready PNGs for standard playing card–sized cards and a grid-based game board. Layers are saved per element (background, grid, spaces, title) and composited into final images.

## What’s Included

- **Card generator**: Creates cards at standard poker size (2.5" × 3.5") with 0.125" bleed, laid out on US Letter sheets (3×2 per page) or as single-card pages.
- **Board generator**: Creates a configurable grid-based board (default 18" × 24").
- **Sample configs**: Starter `cards.json` and `board.json` for Cycles of Survival.

## Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Install dependencies
```bash
npm install
```

### Generate cards (US Letter sheets)
```bash
npm run generate:cards
```
Outputs: `output/cards.png`

Options:
```bash
node game/generate-cards.js --config game/config/cards.json --out output/cards.png
node game/generate-cards.js --singlePages --out output/cards-single.png
```

### Generate board
```bash
npm run generate:board
```
Outputs: `output/Board/board.png`

### Auto-regenerate on changes (watch)
```bash
npm run watch
```
Watches `game/config/*.json` and regenerates cards and board automatically.

### Choose viewing style: sheet vs single-page
- Sheet (multiple cards per US Letter page):
	```bash
	npm run generate:cards:sheet
	xdg-open output/cards.png
	```
- Single pages (one card per image in one PNG sprite sheet):
	```bash
	npm run generate:cards:single
	xdg-open output/cards-single.png
	```
- Watchers per style:
	```bash
	npm run start:cards:sheet
	npm run start:cards:single
	```

### Generate a single card as its own PNG
By id:
```bash
npm run generate:cards -- --cardId hope --out output/hope.png
xdg-open output/hope.png
```
By title:
```bash
npm run generate:cards -- --cardTitle "Forage" --out output/forage.png
```
By index (0-based):
```bash
npm run generate:cards -- --cardIndex 0 --out output/card-0.png
```

Single-card default output structure
- When targeting a single card (by id/title/index) without specifying `--out`, files are written under:
	- `output/Card/Organism/Plant/Organism-Plant-<plant-name>.png`
	- Example: `output/Card/Organism/Plant/Organism-Plant-hope.png`

Per-card exports (all)
- Using `--each`, every card is exported to:
	- `output/Card/Organism/Plant/Organism-Plant-<plant-name>.png`

### Export each card into separate PNGs
```bash
npm run generate:cards -- --each --out output/cards
```
This writes `output/cards/<card-name>.png` for every card.

Options:
```bash
node game/generate-board.js --config game/config/board.json --out output/Board/board.png
```

## File Reference

- `game/generate-cards.js`: PNG generator for cards (poker size, with bleed and crop marks).
- `game/generate-board.js`: PNG generator for a grid-based board with labels and layer compositing.
- `game/config/cards.json`: Sample card set for Cycles of Survival.
- `game/config/board.json`: Sample board config (18" × 24" grid).

## Notes

- The legacy React frontend and Express backend were removed in this branch to declutter. Refer to repository history or other branches if you need them.
- Cards are laid out 3 columns × 2 rows per US Letter page when using sheet mode to accommodate bleed.

Auto-open behavior
- Generators attempt to auto-open created PNGs. If your environment cannot open files automatically, add `--noOpen` to the command, or open manually.

## CI Builds & Releases

- Every push to this branch runs a GitHub Action that:
	- Installs deps, generates PNGs, uploads them as build artifacts
	- Publishes a timestamped GitHub Release (e.g., `assets-YYYYMMDD-HHMMSS`) with `cards.png` and `board.png`
- This keeps prior versions accessible on GitHub while keeping the repo clean. Generated `output/` is ignored by Git.

## Backups on Your Cloud Desktop

- Option 1: Run `npm run watch` locally and keep the repo inside a synced folder (e.g., iCloud/Dropbox/OneDrive). The `output/` folder will always contain the latest PNGs for your devices.
- Option 2: Download PNGs from the latest GitHub Release when needed.

## Contributing
Issues and PRs are welcome. Please keep changes focused on the game asset generation and related design content for this branch.

## License
MIT
# Copilot Instructions for Cycles of Survival: Cycles of Survival

## Project Overview
- **Purpose:** Node.js-based generators for print-ready PNGs of cards and a board for the physical game "Cycles of Survival."
- **Main outputs:** Poker-sized cards (with bleed, crop marks) and a grid-based board, composited from multiple layers.
- **Structure:**
  - `game/`: Core generators and configs
    - `generate-cards.js`, `generate-board.js`, `generate-organism-working-cards.js`
    - `config/`: JSON configs for cards, board, organisms
    - `lib/`: PNG, file, and layout utilities (board/cards)
  - `output/`: Generated PNGs (ignored by git)
  - `card-project/`: Legacy and asset-related files

## Key Workflows
- **Install:** `npm install`
- **Generate cards (sheet):** `npm run generate:cards` → `output/cards.png`
- **Generate cards (single):** `npm run generate:cards:single` → `output/cards-single.png`
- **Generate board:** `npm run generate:board` → `output/Board/board.png`
- **Watch for changes:** `npm run watch` (auto-regenerates on config changes)
- **Export each card as PNG:** `npm run generate:cards -- --each --out output/cards`
- **Generate a single card:** `npm run generate:cards -- --cardId <id> --out output/<id>.png`

## Project-Specific Patterns
- **Layered PNG generation:** Each visual element (background, grid, title, etc.) is a separate layer, composited in the generator scripts.
- **Config-driven:** All card/board content and layout are defined in JSON under `game/config/`.
- **Output structure:**
  - Sheets: `output/cards.png`
  - Single cards: `output/cards-single.png` or `output/Card/Organism/Plant/Organism-Plant-<name>.png`
  - Board: `output/Board/board.png`
- **No frontend/backend:** This branch is tooling-only; web app code was removed.
- **Auto-open PNGs:** Generators try to open PNGs after creation; use `--noOpen` to disable.

## Conventions & Tips
- **Card layout:** 3×2 per US Letter sheet, with 0.125" bleed.
- **Board size:** Default 18"×24", configurable.
- **Use `lib/` for helpers:** All image, layout, and file utilities are in `game/lib/`.
- **CI/CD:** GitHub Actions auto-generate and release PNGs on push; see README for details.
- **Legacy code:** Ignore web app remnants; focus on generator scripts and configs.

## Examples
- To generate all cards as individual PNGs:
  ```bash
  npm run generate:cards -- --each --out output/cards
  ```
- To generate a single card by title:
  ```bash
  npm run generate:cards -- --cardTitle "Forage" --out output/forage.png
  ```
- To watch and auto-regenerate on config changes:
  ```bash
  npm run watch
  ```

## Reference Files
- `game/generate-cards.js`, `game/generate-board.js`: Main entry points
- `game/config/cards.json`, `game/config/board.json`: Core configs
- `game/lib/`: Utility modules for PNG/layout

---
For more, see the root `README.md`.

# Card Project Layout

Proposed structure for PNG layer-driven card generation:

- assets/ — Source PNG layers (frames, icons, backgrounds)
- generator/ — Code that composes layers into final cards/boards
- viewer/ — (Optional) Web app to preview cards

This repo currently uses the `game/` folder to generate PNGs:

- Run board: `node game/generate-board.js --out output/Board/board.png`
- Run cards sheet: `node game/generate-cards.js --out output/cards.png`
- Single card: `node game/generate-cards.js --each`

You can gradually move code from `game/` into `card-project/generator/src/` as the layering assets are established.

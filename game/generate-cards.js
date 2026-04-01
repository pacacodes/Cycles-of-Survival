#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  INCH,
  CARD_TRIM_W,
  CARD_TRIM_H,
  CARD_BLEED_W,
  CARD_BLEED_H,
  BLEED,
  PAGE_SIZE,
  PAGE_W,
  PAGE_H,
  COLS,
  ROWS,
  GAP_X,
  GAP_Y
} = require('./lib/size');
const { ensureDirForFile, ensureDir, slugify, autoOpen } = require('./lib/file');
// PNG-based card layout (replaces PDF generation)
const { layoutSheetPNG, layoutSinglePagesPNG, writeEachCardPNG, writeSingleCardPNG } = require('./lib/cards/layout-png');
const { selectSingleCard } = require('./lib/cards/select');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    config: 'game/config/cards.json',
    out: 'output/cards.png',
    mode: 'sheet', // 'sheet' (grid on letter) or 'single' (all cards, one image each)
    cardIndex: null,
    cardTitle: null,
    cardId: null,
    each: false, // write each card as its own PNG into a folder
    noOpen: false,
    printSafe: false // hide crop/trim guides for final print art
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--config' && args[i + 1]) opts.config = args[++i];
    else if (a === '--out' && args[i + 1]) opts.out = args[++i];
    else if (a === '--singlePages') opts.mode = 'single';
    else if (a === '--cardIndex' && args[i + 1]) opts.cardIndex = parseInt(args[++i], 10);
    else if (a === '--cardTitle' && args[i + 1]) opts.cardTitle = args[++i];
    else if (a === '--cardId' && args[i + 1]) opts.cardId = args[++i];
    else if (a === '--each') opts.each = true;
    else if (a === '--noOpen') opts.noOpen = true;
    else if (a === '--printSafe') opts.printSafe = true;
  }
  return opts;
}



function loadCards(configPath) {
  const abs = path.resolve(process.cwd(), configPath);
  const raw = fs.readFileSync(abs, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.cards)) throw new Error('cards.json must contain an array field: cards');
  return data.cards;
}

(async function main() {
  try {
    const opts = parseArgs();
    const cards = loadCards(opts.config);
    ensureDirForFile(opts.out);

    // Single-card selection
    const single = selectSingleCard(cards, opts);
    if (single) {
        // Folder structure: output/Card/Organism/Plant
        const baseDir = path.resolve(process.cwd(), 'output/Card/Organism/Plant');
        ensureDir(baseDir);
        const plantName = slugify(single.card.title || single.card.id || single.name);
        const fileName = `Organism-Plant-${plantName}.png`;
        const outPath = path.resolve(baseDir, fileName);
        await writeSingleCardPNG(single.card, outPath, { includeGuides: !opts.printSafe });
        console.log(`Wrote single card PNG to ${outPath}`);
        if (!opts.noOpen) autoOpen(outPath);
        return;
    }

    // Each card to its own file
    if (opts.each) {
      const outDir = path.resolve(process.cwd(), 'output/Card/Organism/Plant');
      await writeEachCardPNG(cards, outDir, { includeGuides: !opts.printSafe });
      console.log(`Wrote ${cards.length} front/back card PNGs to ${outDir}`);
      if (!opts.noOpen) autoOpen(outDir);
      return;
    }

    // Batch modes (sheet or single-pages)
    const layoutOpts = { includeGuides: !opts.printSafe };
    const { write } = opts.mode === 'single' ? layoutSinglePagesPNG(cards, layoutOpts) : layoutSheetPNG(cards, layoutOpts);
    const outPath = path.resolve(process.cwd(), opts.out);
    await write(outPath);
    console.log(`Wrote ${cards.length} cards PNG to ${outPath}`);
    if (!opts.noOpen) autoOpen(outPath);
  } catch (err) {
    console.error('Failed to generate cards:', err.message);
    process.exit(1);
  }
})();

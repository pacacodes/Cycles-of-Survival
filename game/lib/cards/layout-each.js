/**
 * Per-card and single-card PNG writers.
 * drawCardPNG is lazy-required from layout-png to avoid circular-require issues.
 */

const fs = require('fs');
const path = require('path');
const { createCanvasInches, writeCanvasPNG, configureCanvasContext } = require('../png');
const { INCH, CARD_BLEED_W, CARD_BLEED_H } = require('../size');
const { drawCardGuides } = require('./helpers/guides');
const { writeFrontBackPairPNG } = require('./layout-each-pair');

function getEachCardBaseName(card, options = {}) {
  const baseName = (card.fileName && card.fileName.replace(/\.png$/, ''))
    || (options.fileName && options.fileName.replace(/\.png$/, ''))
    || `Organism-Plant-${(card.id || card.title || 'card')}`;

  return baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
}

async function writeSingleCardPNG(card, outPath, options = {}) {
  const { drawCardPNG } = require('./layout-png');
  const dpi = options.dpi || 300;
  const includeGuides = options.includeGuides !== false;
  const { canvas, ctx, scale } = createCanvasInches(CARD_BLEED_W / INCH, CARD_BLEED_H / INCH, dpi);
  await drawCardPNG(ctx, 0, 0, card, scale, { includeGuides: false });
  if (includeGuides) {
    drawCardGuides(ctx, 0, 0, scale);
  }
  writeCanvasPNG(canvas, outPath, dpi);
}

async function writeEachCardPNG(cards, outDir, options = {}) {
  const { drawCardPNG } = require('./layout-png');
  fs.mkdirSync(outDir, { recursive: true });
  const dpi = options.dpi || 300;
  const includeGuides = options.includeGuides !== false;
  const gapPt = options.gapPt != null ? options.gapPt : (0.5 * INCH);

  try {
    for (const card of cards) {
      const baseName = getEachCardBaseName(card, options);
      const filePath = path.resolve(outDir, `${baseName}.png`);
      try {
        await writeFrontBackPairPNG({
          card,
          outPath: filePath,
          dpi,
          gapPt,
          includeGuides,
          drawFront: async (ctx, xPt, yPt, cardData, scale) => {
            await drawCardPNG(ctx, xPt, yPt, cardData, scale, { includeGuides: false });
          },
        });
      } catch (err) {
        console.error('Failed to write PNG:', {
          filePath,
          card,
          error: err && err.message ? err.message : err,
        });
        throw err;
      }
    }
  } catch (e) {
    console.error('Error in writeEachCardPNG:', e);
    throw e;
  }
}

module.exports = { getEachCardBaseName, writeSingleCardPNG, writeEachCardPNG };

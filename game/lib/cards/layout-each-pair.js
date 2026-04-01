const { createCanvasInches, writeCanvasPNG } = require('../png');
const { INCH, CARD_BLEED_W, CARD_BLEED_H } = require('../size');
const { drawCardGuides } = require('./helpers/guides');
const drawCardBackPNG = require('./layers/back');

/**
 * Renders one export image with front (left) and back (right).
 */
async function writeFrontBackPairPNG({ card, outPath, dpi = 300, gapPt = 0.5 * INCH, drawFront, includeGuides = true }) {
  const totalWidthIn = ((CARD_BLEED_W * 2) + gapPt) / INCH;
  const totalHeightIn = CARD_BLEED_H / INCH;
  const { canvas, ctx, scale } = createCanvasInches(totalWidthIn, totalHeightIn, dpi);

  const frontXPt = 0;
  const backXPt = CARD_BLEED_W + gapPt;
  const yPt = 0;

  // Draw back first so front-side clipping/state cannot hide the back panel.
  await drawCardBackPNG(ctx, backXPt, yPt, scale, card);
  await drawFront(ctx, frontXPt, yPt, card, scale, { includeGuides });

  if (includeGuides) {
    drawCardGuides(ctx, frontXPt, yPt, scale);
    drawCardGuides(ctx, backXPt, yPt, scale);
  }

  writeCanvasPNG(canvas, outPath);
}

module.exports = {
  writeFrontBackPairPNG,
};
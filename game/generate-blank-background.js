#!/usr/bin/env node

const { createCanvasInches, writeCanvasPNG } = require('./lib/png');
const { INCH, CARD_TRIM_W, CARD_TRIM_H, CARD_BLEED_W, CARD_BLEED_H, BLEED } = require('./lib/size');
const drawCropMarksPNG = require('./lib/cards/helpers/cropmarks');

/**
 * Generates a blank card base showing front and back side by side
 * This serves as the foundation for all card designs
 */
function generateBlankBackground(outPath, options = {}) {
  const dpi = options.dpi || 300;
  const gap = 0.25 * INCH; // spacing between front and back
  
  // Canvas width: two cards + gap between them
  const totalWidthInches = (CARD_BLEED_W * 2 + gap) / INCH;
  const totalHeightInches = CARD_BLEED_H / INCH;
  
  const { canvas, ctx, scale } = createCanvasInches(totalWidthInches, totalHeightInches, dpi);
  
  // Fill entire canvas with white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw FRONT card (left)
  drawBlankCard(ctx, 0, 0, scale, 'FRONT');
  
  // Draw BACK card (right)
  const backXpt = CARD_BLEED_W + gap;
  drawBlankCard(ctx, backXpt, 0, scale, 'BACK');
  
  writeCanvasPNG(canvas, outPath, dpi);
  console.log(`✓ Blank background card generated: ${outPath}`);
}

/**
 * Draw a single blank card with white background and crop marks
 */
function drawBlankCard(ctx, xPt, yPt, scale, label) {
  const x = xPt * scale;
  const y = yPt * scale;
  const w = CARD_BLEED_W * scale;
  const h = CARD_BLEED_H * scale;
  
  // Draw white card background (bleed area)
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  
  // Draw crop/trim marks at the trim line (inside bleed)
  const trimX = xPt + BLEED;
  const trimY = yPt + BLEED;
  drawCropMarksPNG(ctx, trimX, trimY, CARD_TRIM_W, CARD_TRIM_H, scale);
  
  // Optional: Add label to identify front/back
  if (label) {
    ctx.save();
    ctx.font = `${12 * scale}px "DejaVu Sans", sans-serif`;
    ctx.fillStyle = '#CCCCCC';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h / 2);
    ctx.restore();
  }
}

// Run if called directly
if (require.main === module) {
  const outPath = process.argv[2] || 'output/Card/blank-background.png';
  generateBlankBackground(outPath);
}

module.exports = { generateBlankBackground };

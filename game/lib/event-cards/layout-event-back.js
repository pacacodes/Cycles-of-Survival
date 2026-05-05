const { BLEED, CARD_BLEED_W, CARD_BLEED_H } = require('../size');
const drawTrim = require('../cards/layers/trim');
const roundedRectPath = require('../cards/utils/path');

const BACKGROUND_WHITE = '#FFFFFF';

/**
 * Draw event card back - completely blank white
 */
async function drawEventCardBack(ctx, xPt, yPt, scale, event) {
  const x = xPt * scale;
  const y = yPt * scale;
  const bleedW = CARD_BLEED_W * scale;
  const bleedH = CARD_BLEED_H * scale;
  const safeX = x + BLEED * scale;
  const safeY = y + BLEED * scale;

  ctx.save();
  
  // White background
  ctx.fillStyle = BACKGROUND_WHITE;
  ctx.fillRect(x, y, bleedW, bleedH);

  ctx.restore();

  // Match the front card border styling exactly
  drawTrim(ctx, safeX, safeY, scale, { roundedRectPath });
}

module.exports = {
  drawEventCardBack,
};

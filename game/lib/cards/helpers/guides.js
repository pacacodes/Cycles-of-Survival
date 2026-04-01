const { BLEED, CARD_TRIM_W, CARD_TRIM_H } = require('../../size');
const drawCropMarksPNG = require('./cropmarks');
const drawTrim = require('../layers/trim');
const roundedRectPath = require('../utils/path');

/**
 * Draw all visual guides for a card position.
 * - Crop marks
 * - Card trim/perimeter outline
 */
function drawCardGuides(ctx, xPt, yPt, scale) {
  drawCropMarksPNG(ctx, xPt + BLEED, yPt + BLEED, CARD_TRIM_W, CARD_TRIM_H, scale);
  drawTrim(ctx, (xPt + BLEED) * scale, (yPt + BLEED) * scale, scale, { roundedRectPath });
}

module.exports = {
  drawCardGuides,
};
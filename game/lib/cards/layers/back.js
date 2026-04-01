const { BLEED, CARD_TRIM_W, CARD_TRIM_H, CARD_BLEED_W, CARD_BLEED_H } = require('../../size');
const drawBackDnaLayer = require('./back-dna');
const { loadImage } = require('canvas');
const path = require('path');
const drawTrim = require('./trim');
const roundedRectPath = require('../utils/path');

const BACKGROUND_WHITE = '#FFFFFF';
const WATER_BACKGROUND_PATH = path.resolve(__dirname, 'main-photo', 'water background.png');

let waterBackgroundImagePromise = null;

function getWaterBackgroundImage() {
  if (!waterBackgroundImagePromise) {
    waterBackgroundImagePromise = loadImage(WATER_BACKGROUND_PATH).catch(() => null);
  }
  return waterBackgroundImagePromise;
}

/**
 * Draws a generic card back inside the bleed area.
 */
module.exports = async function drawCardBackPNG(ctx, xPt, yPt, scale, card) {
  const x = xPt * scale;
  const y = yPt * scale;
  const bleedW = CARD_BLEED_W * scale;
  const bleedH = CARD_BLEED_H * scale;
  const safeX = x + BLEED * scale;
  const safeY = y + BLEED * scale;
  const waterBackgroundImage = await getWaterBackgroundImage();

  ctx.save();
  // Keep a white base as a fallback, then cover the full bleed with the water texture when available.
  ctx.fillStyle = BACKGROUND_WHITE;
  ctx.fillRect(x, y, bleedW, bleedH);

  if (waterBackgroundImage) {
    const scaleFactor = Math.max(
      bleedW / waterBackgroundImage.width,
      bleedH / waterBackgroundImage.height
    );
    const drawW = waterBackgroundImage.width * scaleFactor;
    const drawH = waterBackgroundImage.height * scaleFactor;
    const drawX = x + bleedW - drawW;

    ctx.beginPath();
    ctx.rect(x, y, bleedW, bleedH);
    ctx.clip();
    ctx.drawImage(waterBackgroundImage, drawX, y, drawW, drawH);
  }

  ctx.restore();

  // Match the front card border styling exactly.
  drawTrim(ctx, safeX, safeY, scale, { roundedRectPath });

  await drawBackDnaLayer(ctx, x, y, scale, card, waterBackgroundImage);
};
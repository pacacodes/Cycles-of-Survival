const { CARD_BLEED_W, CARD_BLEED_H } = require('../../../size');
const path = require('path');
const fs = require('fs');

// T. rex background renderer for Card 60
module.exports = async function tRexBackground(ctx, x, y, { width, height, corner, scale, roundedRectPath }) {
  // Draw the default organism background first
  const grad = ctx.createLinearGradient(x, y, x + width, y);
  grad.addColorStop(0, '#E8F5E9');
  grad.addColorStop(1, '#A5D6A7');
  ctx.save();
  ctx.fillStyle = grad;
  roundedRectPath(ctx, x, y, width, height, corner);
  ctx.fill();
  ctx.restore();

  // Overlay the T. rex PNG
  const { loadImage } = require('canvas');
  const imgPath = path.resolve(__dirname, '../main-photo/Tyrannosaurus rex.png');
  console.log('[tRexBackground] PNG path:', imgPath);
  if (fs.existsSync(imgPath)) {
    console.log('[tRexBackground] PNG exists, loading...');
    try {
      const img = await loadImage(imgPath);
      console.log('[tRexBackground] PNG loaded:', !!img);
      // Scale the image to fill the card minus the color block title area
      // Assume color block height is same as used in title-color-block.js
      const colorBlockHeight = Math.round(72 * 0.5 + 20 + 20); // 0.5" in px + 40px extra
      // Fill the card including bleed, minus color block area
      const scaleFactor = 0.99;
      const imgW = width * scaleFactor;
      const imgH = (height - colorBlockHeight) * scaleFactor;
      const imgX = x + (width - imgW) / 2;
      // Keep the top edge where it is
      const imgY = y + colorBlockHeight + 40;
      ctx.save();
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, imgX, imgY, imgW, imgH);
      ctx.restore();
      console.log('[tRexBackground] PNG drawn at', imgX, imgY, imgW, imgH);
    } catch (err) {
      console.error('[tRexBackground] Error loading/drawing PNG:', err);
    }
  } else {
    console.log('[tRexBackground] PNG file does not exist:', imgPath);
  }
};

const { CARD_BLEED_W, CARD_BLEED_H } = require('../../../size');
const path = require('path');
const fs = require('fs');

// Pinus edulis (Piñon pine) background renderer for Card 20
module.exports = async function pinusEdulisBackground(ctx, x, y, { width, height, corner, scale, roundedRectPath }) {
  // Draw the default organism background first
  const grad = ctx.createLinearGradient(x, y, x + width, y);
  grad.addColorStop(0, '#E8F5E9');
  grad.addColorStop(1, '#A5D6A7');
  ctx.save();
  ctx.fillStyle = grad;
  roundedRectPath(ctx, x, y, width, height, corner);
  ctx.fill();
  ctx.restore();

  // Overlay the Pinus edulis PNG
  const { loadImage } = require('canvas');
  const imgPath = path.resolve(__dirname, '../main-photo/Pinus edulis.png');
  if (fs.existsSync(imgPath)) {
    try {
      const img = await loadImage(imgPath);
      // Scale the image to fill the card minus the color block title area
      const colorBlockHeight = Math.round(72 * 0.5 + 20 + 20);
      const scaleFactor = 1.10;
      const imgW = width * scaleFactor;
      const imgH = (height - colorBlockHeight) * scaleFactor;
      const imgX = x + (width - imgW) / 2 + 40;
      const imgY = y + colorBlockHeight - 20;
      ctx.save();
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, imgX, imgY, imgW, imgH);
      ctx.restore();
    } catch (err) {
      ctx.save();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 6 * scale;
      ctx.strokeRect(x, y, width, height * 0.5);
      ctx.restore();
    }
  }
};

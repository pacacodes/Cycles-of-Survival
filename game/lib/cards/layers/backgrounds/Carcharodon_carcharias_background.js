const { CARD_BLEED_W, CARD_BLEED_H } = require('../../../size');
const path = require('path');
const fs = require('fs');

// Carcharodon carcharias (Great white shark) background renderer for Card 29
module.exports = async function carcharodonCarchariasBackground(ctx, x, y, { width, height, corner, scale, roundedRectPath }) {
  // Draw the default organism background first
  const grad = ctx.createLinearGradient(x, y, x + width, y);
  grad.addColorStop(0, '#E8F5E9');
  grad.addColorStop(1, '#A5D6A7');
  ctx.save();
  ctx.fillStyle = grad;
  roundedRectPath(ctx, x, y, width, height, corner);
  ctx.fill();
  ctx.restore();

  // Overlay the Carcharodon carcharias PNG
  const { loadImage } = require('canvas');
  const imgPath = path.resolve(__dirname, '../main-photo/Carcharodon carcharias.png');
  if (fs.existsSync(imgPath)) {
    try {
      const img = await loadImage(imgPath);
      // Card 29 uses an embedded background photo path; keep its tuning isolated here.
      const colorBlockHeight = Math.round(72 * 0.5 + 20 + 20);
      const scaleFactor = 1.04;
      const imgW = width * scaleFactor;
      const imgH = (height - colorBlockHeight) * scaleFactor;
      const imgX = x + (width - imgW) / 2 - 10;
      const imgY = y + colorBlockHeight + 90;
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

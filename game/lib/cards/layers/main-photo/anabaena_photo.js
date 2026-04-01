const { loadImage } = require('canvas');
const path = require('path');

// Draws the Anabaena sp. main photo for Card 1
module.exports = async function anabaenaPhoto(ctx, x, y, { width, height, scale }) {
  ctx.save();
  try {
    const imgPath = path.resolve(__dirname, 'Anabaena_sp.png');
    const img = await loadImage(imgPath);
    const colorBlockHeight = Math.round(72 * 0.5 + 20 + 20); // 0.5" in px + 40px extra
    const scaleFactor = 1.0716; // 5% larger than previous 1.0206
    const targetW = width * scaleFactor;
    const targetH = (height - colorBlockHeight) * scaleFactor;
    const targetX = x + (width - targetW) / 2 - 10;
    const targetY = y + colorBlockHeight + 40 + 74;
    const coverScale = Math.max(targetW / img.width, targetH / img.height);
    const drawW = img.width * coverScale;
    const drawH = img.height * coverScale;
    const drawX = targetX + (targetW - drawW) / 2;
    const drawY = targetY + (targetH - drawH) / 2;
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.rect(targetX, targetY, targetW, targetH);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  } catch (err) {
    // Do nothing if image fails to load
  }
  ctx.restore();
};

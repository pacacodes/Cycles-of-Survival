const { loadImage } = require('canvas');
const path = require('path');
module.exports = async function organismPhoto(ctx, x, y, { width, height, scale, card, photoScaleMultiplier = 1, photoFitMode = 'contain', flipHorizontal = false }) {
  ctx.save();
  // Prefer explicit main_photo from config; fallback to "<scientific_name>.png".
  const photoFile = (card && card.main_photo) || (card && card.scientific_name ? `${card.scientific_name}.png` : '');

  if (photoFile) {
    const imgPath = path.resolve(__dirname, photoFile);
    try {
      const img = await loadImage(imgPath);
      // Fill the target area while preserving original image proportions.
      const colorBlockHeight = Math.round(72 * 0.5 + 20 + 20); // 0.5" in px + 40px extra
      const scaleFactor = 1.10 * photoScaleMultiplier;
      const targetW = width * scaleFactor;
      const targetH = (height - colorBlockHeight) * scaleFactor;
      const targetX = x + (width - targetW) / 2;
      const targetY = y + colorBlockHeight + 40;
      const fitScale = photoFitMode === 'contain'
        ? Math.min(targetW / img.width, targetH / img.height)
        : Math.max(targetW / img.width, targetH / img.height);
      const drawW = img.width * fitScale;
      const drawH = img.height * fitScale;
      const drawX = targetX + (targetW - drawW) / 2;
      const drawY = targetY + (targetH - drawH) / 2;
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.rect(targetX, targetY, targetW, targetH);
      ctx.clip();
      if (flipHorizontal) {
        ctx.translate(drawX + drawW, drawY);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, drawW, drawH);
      } else {
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }
    } catch (err) {
      // Keep card generation resilient if a configured image is missing.
    }
  }
  ctx.restore();
};

const { loadImage } = require('canvas');

// Draws the neon cactus badge PNG centered in a circular placeholder
const { loadImage } = require('canvas');
const path = require('path');

module.exports = async function desertBiome(ctx, x, y, { width, height, scale }) {
  ctx.save();
  const badgeRadius = Math.min(width, height) * 0.5 * 0.9;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  // Draw badge PNG last (top of z-index)
  try {
    const imgPath = path.join(__dirname, '../../badges/biomes/Desert.png');
    const img = await loadImage(imgPath);
    ctx.drawImage(img, centerX - badgeRadius, centerY - badgeRadius, badgeRadius * 2, badgeRadius * 2);
  } catch (err) {
    // Fallback: draw placeholder
    ctx.beginPath();
    ctx.arc(centerX, centerY, badgeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD180';
    ctx.fill();
    ctx.font = `${Math.round(badgeRadius * 0.9)}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DE', centerX, centerY);
  }
  ctx.restore();
};

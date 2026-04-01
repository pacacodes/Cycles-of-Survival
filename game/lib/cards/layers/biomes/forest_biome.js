const { loadImage } = require('canvas');

// Draws the neon forest badge PNG centered in a circular placeholder
const path = require('path');

module.exports = async function forestBiome(ctx, x, y, { width, height, scale }) {
  ctx.save();
  const badgeRadius = Math.min(width, height) * 0.5 * 0.9;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  // Placeholder: draw a green circle with 'FO' text
  ctx.beginPath();
  ctx.arc(centerX, centerY, badgeRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#4CAF50';
  ctx.fill();
  ctx.font = `${Math.round(badgeRadius * 0.9)}px sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FO', centerX, centerY);
  ctx.restore();
  try {
    const imgPath = path.join(__dirname, '../../badges/biomes/Forest.png');
    const img = await loadImage(imgPath);
    ctx.drawImage(img, centerX - badgeRadius, centerY - badgeRadius, badgeRadius * 2, badgeRadius * 2);
  } catch (err) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, badgeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#4CAF50';
    ctx.fill();
    ctx.font = `${Math.round(badgeRadius * 0.9)}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FO', centerX, centerY);
  }
};

const { loadImage } = require('canvas');

// Draws the neon marine badge PNG centered in a circular placeholder
module.exports = async function marineBiome(ctx, x, y, { width, height, scale }) {
  ctx.save();
  const badgeRadius = Math.min(width, height) * 0.5 * 0.9;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  try {
    const imgPath = path.join(__dirname, '../../badges/biomes/Marine.png');
    const img = await loadImage(imgPath);
    ctx.drawImage(img, centerX - badgeRadius, centerY - badgeRadius, badgeRadius * 2, badgeRadius * 2);
  } catch (err) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, badgeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#00B8D4';
    ctx.fill();
    ctx.font = `${Math.round(badgeRadius * 0.9)}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MA', centerX, centerY);
  }
  ctx.restore();
};

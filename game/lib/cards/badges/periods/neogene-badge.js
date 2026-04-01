const { loadImage } = require('canvas');
const path = require('path');
let neogeneImg = null;

module.exports = async function neogeneBadge(ctx, x, y, radius, card, scale) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#B3C6E7';
  ctx.fill();
  ctx.restore();

  ctx.save();
  const imgPath = path.join(__dirname, 'Neogene.png');
  if (!neogeneImg) {
    neogeneImg = await loadImage(imgPath);
  }
  const scaleDown = 0.91;
  const size = radius * 2 * scaleDown;
  ctx.drawImage(neogeneImg, x - size / 2, y - size / 2, size, size);
  ctx.restore();
};

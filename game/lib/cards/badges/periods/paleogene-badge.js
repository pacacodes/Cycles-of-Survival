const { loadImage } = require('canvas');
const path = require('path');

module.exports = async function (ctx, x, y, radius, card, scale) {
  ctx.save();
  const imgPath = path.join(__dirname, './Paleogene.png');
  const img = await loadImage(imgPath);
  const scaleDown = 0.95;
  const size = radius * 2 * scaleDown;
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  ctx.restore();
};
const { loadImage } = require('canvas');
const path = require('path');

module.exports = async function (ctx, x, y, radius, card, scale) {
  let _x = x, _y = y, _radius = radius;
  if (typeof x === 'object' && x !== null && 'x' in x) {
    const options = x;
    _x = options.x;
    _y = options.y;
    _radius = options.radius;
  }
  const imgPath = path.join(__dirname, './Nutrient_Cycler_Detoxifier.png');
  const img = await loadImage(imgPath);
  const scaleFactor = (_radius * 2 * 0.98398125) / Math.max(img.width, img.height);
  const badgeWidth = img.width * scaleFactor;
  const badgeHeight = img.height * scaleFactor;
  const badgeX = _x - badgeWidth / 2;
  const badgeY = _y - badgeHeight / 2;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.drawImage(img, badgeX, badgeY, badgeWidth, badgeHeight);
  ctx.restore();
};

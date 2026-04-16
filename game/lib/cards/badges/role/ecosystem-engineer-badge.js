const { loadImage } = require('canvas');
const path = require('path');

module.exports = async function (ctx, x, y, radius, card, scale) {
  let _x = x, _y = y, _radius = radius;
  if (typeof x === 'object' && x !== null && 'x' in x) {
    _x = x.x; _y = x.y; _radius = x.radius;
  }
  ctx.save();
  const img = await loadImage(path.join(__dirname, 'Ecosystem_Engineer.png'));
  const size = _radius * 2 * 0.95;
  ctx.drawImage(img, _x - size / 2, _y - size / 2, size, size);
  ctx.restore();
};

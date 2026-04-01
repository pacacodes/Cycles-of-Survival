const { loadImage } = require('canvas');
const path = require('path');

module.exports = async function (ctx, x, y, radius, card, scale) {
  // Support both (ctx, x, y, radius, card, scale) and (ctx, options)
  let _x = x, _y = y, _radius = radius, _scale = scale;
  if (typeof x === 'object' && x !== null && 'x' in x) {
    const options = x;
    _x = options.x;
    _y = options.y;
    _radius = options.radius;
    _scale = options.scale || scale;
  }
  ctx.save();
  const imgPath = path.join(__dirname, './PROTEROZOIC.png');
  const img = await loadImage(imgPath);
  const scaleDown = 0.95;
  const size = _radius * 2 * scaleDown;
  ctx.drawImage(img, _x - size / 2, _y - size / 2, size, size);
  ctx.restore();
};
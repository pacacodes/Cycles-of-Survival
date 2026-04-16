const { loadImage } = require('canvas');
const path = require('path');

module.exports = async function (ctx, x, y, radius, card, scale) {
  // Support both (ctx, x, y, radius, card, scale) and (ctx, options)
  let _x = x, _y = y, _radius = radius;
  if (typeof x === 'object' && x !== null && 'x' in x) {
    const options = x;
    _x = options.x;
    _y = options.y;
    _radius = options.radius;
  }
  ctx.save();
  const imgPath = path.join(__dirname, './Decomposer_Detritivore.png');
  let img;
  try {
    img = await loadImage(imgPath);
  } catch (_) {
    // PNG not yet available — draw placeholder circle
    ctx.beginPath();
    ctx.arc(_x, _y, _radius * 0.9, 0, 2 * Math.PI);
    ctx.fillStyle = '#8B4513';
    ctx.fill();
    ctx.restore();
    return;
  }
  const scaleDown = 0.95;
  const size = _radius * 2 * scaleDown;
  ctx.drawImage(img, _x - size / 2, _y - size / 2, size, size);
  ctx.restore();
};

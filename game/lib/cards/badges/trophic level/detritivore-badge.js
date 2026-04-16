const { loadImage } = require('canvas');
const path = require('path');

module.exports = async function (ctx, x, y, radius, card, scale) {
  let _x = x, _y = y, _radius = radius;
  if (typeof x === 'object' && x !== null && 'x' in x) {
    _x = x.x; _y = x.y; _radius = x.radius;
  }
  ctx.save();
  const imgPath = path.join(__dirname, './Detritivore.png');
  let img;
  try {
    img = await loadImage(imgPath);
  } catch (_) {
    // PNG not yet available — draw placeholder circle
    ctx.beginPath();
    ctx.arc(_x, _y, _radius * 0.9, 0, 2 * Math.PI);
    ctx.fillStyle = '#5C4033';
    ctx.fill();
    ctx.restore();
    return;
  }
  const size = _radius * 2 * 0.95;
  ctx.drawImage(img, _x - size / 2, _y - size / 2, size, size);
  ctx.restore();
};

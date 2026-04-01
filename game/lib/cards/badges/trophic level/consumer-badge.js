module.exports = function (ctx, x, y, radius, card, scale) {
  // Support both (ctx, x, y, radius, card, scale) and (ctx, options)
  let _x = x, _y = y, _radius = radius;
  if (typeof x === 'object' && x !== null && 'x' in x) {
    const options = x;
    _x = options.x;
    _y = options.y;
    _radius = options.radius;
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(_x, _y, _radius * 0.9, 0, 2 * Math.PI);
  ctx.fillStyle = '#cccccc';
  ctx.fill();
  ctx.restore();
};

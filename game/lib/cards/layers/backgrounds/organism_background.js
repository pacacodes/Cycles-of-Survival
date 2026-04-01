module.exports = function organismBackground(ctx, x, y, { width, height, corner, scale, roundedRectPath }) {
  const grad = ctx.createLinearGradient(x, y, x + width, y);
  grad.addColorStop(0, '#E8F5E9');
  grad.addColorStop(1, '#A5D6A7');
  ctx.save();
  ctx.fillStyle = grad;
  roundedRectPath(ctx, x, y, width, height, corner);
  ctx.fill();
  ctx.restore();
};

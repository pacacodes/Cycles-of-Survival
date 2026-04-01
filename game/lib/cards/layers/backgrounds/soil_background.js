module.exports = function soilBackground(ctx, x, y, { width, height, corner, scale, roundedRectPath }) {
  const grad = ctx.createLinearGradient(x, y, x, y + height);
  grad.addColorStop(0, '#7B5E2A');
  grad.addColorStop(0.5, '#9C6C3C');
  grad.addColorStop(1, '#B07A47');
  ctx.save();
  ctx.fillStyle = grad;
  roundedRectPath(ctx, x, y, width, height, corner);
  ctx.fill();
  ctx.restore();
};

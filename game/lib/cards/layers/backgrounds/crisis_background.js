module.exports = function crisisBackground(ctx, x, y, { width, height, corner, scale, roundedRectPath }) {
  const grad = ctx.createLinearGradient(x, y, x, y + height);
  grad.addColorStop(0, '#FFEBEE');
  grad.addColorStop(1, '#EF9A9A');
  ctx.save();
  ctx.fillStyle = grad;
  roundedRectPath(ctx, x, y, width, height, corner);
  ctx.fill();
  ctx.restore();
};

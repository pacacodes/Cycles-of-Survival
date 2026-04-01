module.exports = function biomeBackground(ctx, x, y, { width, height, corner, scale, roundedRectPath }) {
  const grad = ctx.createLinearGradient(x, y, x, y + height);
  grad.addColorStop(0, '#E0F7FA');
  grad.addColorStop(1, '#B2EBF2');
  ctx.save();
  ctx.fillStyle = grad;
  roundedRectPath(ctx, x, y, width, height, corner);
  ctx.fill();
  ctx.restore();
};

module.exports = function earthEventBackground(ctx, x, y, { width, height, corner, scale, roundedRectPath }) {
  const grad = ctx.createLinearGradient(x, y, x + width, y + height);
  grad.addColorStop(0, '#FFE7B0');
  grad.addColorStop(1, '#FFD27A');
  ctx.save();
  ctx.fillStyle = grad;
  roundedRectPath(ctx, x, y, width, height, corner);
  ctx.fill();
  ctx.restore();
};

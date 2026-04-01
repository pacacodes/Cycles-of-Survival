module.exports = function eraPaleozoic(ctx, x, y, { width, scale }) {
  ctx.save();
  ctx.fillStyle = '#E8F5E9';
  ctx.font = `${Math.round(9 * scale)}px Helvetica`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Era: Paleozoic', x, y);
  ctx.restore();
};

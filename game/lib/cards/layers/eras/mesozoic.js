module.exports = function eraMesozoic(ctx, x, y, { width, scale }) {
  ctx.save();
  ctx.fillStyle = '#FFF3E0';
  ctx.font = `${Math.round(9 * scale)}px Helvetica`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Era: Mesozoic', x, y);
  ctx.restore();
};

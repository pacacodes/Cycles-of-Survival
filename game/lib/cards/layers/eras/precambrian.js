module.exports = function eraPrecambrian(ctx, x, y, { width, scale }) {
  ctx.save();
  ctx.fillStyle = '#F3E5F5';
  ctx.font = `${Math.round(9 * scale)}px Helvetica`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Era: Precambrian', x, y);
  ctx.restore();
};

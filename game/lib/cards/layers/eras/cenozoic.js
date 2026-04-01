module.exports = function eraCenozoic(ctx, x, y, { width, scale }) {
  ctx.save();
  ctx.fillStyle = '#E3F2FD';
  ctx.font = `${Math.round(9 * scale)}px Helvetica`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Era: Cenozoic', x, y);
  ctx.restore();
};

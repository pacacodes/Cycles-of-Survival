module.exports = function trophicApex(ctx, x, y, { width, scale }) {
  ctx.save();
  ctx.fillStyle = '#FFE082';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Trophic: Apex', x, y);
  ctx.restore();
};

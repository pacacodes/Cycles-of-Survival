module.exports = function trophicConsumer(ctx, x, y, { width, scale }) {
  ctx.save();
  ctx.fillStyle = '#BBDEFB';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Trophic: Consumer', x, y);
  ctx.restore();
};

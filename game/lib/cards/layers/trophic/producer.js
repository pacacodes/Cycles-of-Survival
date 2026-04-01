module.exports = function trophicProducer(ctx, x, y, { width, scale }) {
  ctx.save();
  ctx.fillStyle = '#C8E6C9';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Trophic: Producer', x, y);
  ctx.restore();
};

module.exports = function trophicDecomposer(ctx, x, y, { width, scale }) {
  ctx.save();
  ctx.fillStyle = '#D7CCC8';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Trophic: Decomposer', x, y);
  ctx.restore();
};

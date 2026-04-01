module.exports = function loamSoil(ctx, x, y, { width, height, scale }) {
  ctx.save();
  ctx.fillStyle = 'rgba(121,85,72,0.2)';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = '#4E342E';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Soil: Loam', x + 4 * scale, y + 4 * scale);
  ctx.restore();
};

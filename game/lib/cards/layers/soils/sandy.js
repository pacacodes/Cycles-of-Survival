module.exports = function sandySoil(ctx, x, y, { width, height, scale }) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,213,79,0.2)';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = '#F9A825';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Soil: Sandy', x + 4 * scale, y + 4 * scale);
  ctx.restore();
};

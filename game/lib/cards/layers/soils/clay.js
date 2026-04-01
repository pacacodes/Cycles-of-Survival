module.exports = function claySoil(ctx, x, y, { width, height, scale }) {
  ctx.save();
  ctx.fillStyle = 'rgba(141,110,99,0.2)';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = '#6D4C41';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Soil: Clay', x + 4 * scale, y + 4 * scale);
  ctx.restore();
};

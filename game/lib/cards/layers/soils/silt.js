module.exports = function siltSoil(ctx, x, y, { width, height, scale }) {
  ctx.save();
  ctx.fillStyle = 'rgba(158,158,158,0.2)';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = '#616161';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Soil: Silt', x + 4 * scale, y + 4 * scale);
  ctx.restore();
};

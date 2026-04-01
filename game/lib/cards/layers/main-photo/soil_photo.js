module.exports = function soilPhoto(ctx, x, y, { width, height, scale }) {
  ctx.save();
  ctx.fillStyle = '#F1E0C5';
  ctx.strokeStyle = '#8D6E63';
  ctx.lineWidth = 2 * scale;
  ctx.fillRect(x, y, width, height * 0.5);
  ctx.strokeRect(x, y, width, height * 0.5);
  ctx.fillStyle = '#5D4037';
  ctx.font = `${Math.round(12 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Soil Photo', x + width / 2, y + height * 0.25);
  ctx.restore();
};

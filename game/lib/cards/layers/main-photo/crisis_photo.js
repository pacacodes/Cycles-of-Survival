module.exports = function crisisPhoto(ctx, x, y, { width, height, scale }) {
  ctx.save();
  ctx.fillStyle = '#FFEBEE';
  ctx.strokeStyle = '#E57373';
  ctx.lineWidth = 2 * scale;
  ctx.fillRect(x, y, width, height * 0.5);
  ctx.strokeRect(x, y, width, height * 0.5);
  ctx.fillStyle = '#B71C1C';
  ctx.font = `${Math.round(12 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Crisis Photo', x + width / 2, y + height * 0.25);
  ctx.restore();
};

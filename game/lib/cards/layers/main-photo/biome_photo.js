module.exports = function biomePhoto(ctx, x, y, { width, height, scale }) {
  ctx.save();
  ctx.fillStyle = '#E0F7FA';
  ctx.strokeStyle = '#00ACC1';
  ctx.lineWidth = 2 * scale;
  ctx.fillRect(x, y, width, height * 0.5);
  ctx.strokeRect(x, y, width, height * 0.5);
  ctx.fillStyle = '#006064';
  ctx.font = `${Math.round(12 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Biome Photo', x + width / 2, y + height * 0.25);
  ctx.restore();
};

module.exports = function biomeTypeBadge(ctx, x, y, { width, scale }) {
  ctx.save();
  const h = 18 * scale;
  ctx.fillStyle = '#B2EBF2';
  ctx.strokeStyle = '#00838F';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.roundRect(x, y, width, h, 6 * scale);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#006064';
  ctx.font = `${Math.round(10 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Biome', x + width / 2, y + h / 2);
  ctx.restore();
};

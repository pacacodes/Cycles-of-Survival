module.exports = function crisisTypeBadge(ctx, x, y, { width, scale }) {
  ctx.save();
  const h = 18 * scale;
  ctx.fillStyle = '#EF9A9A';
  ctx.strokeStyle = '#C62828';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.roundRect(x, y, width, h, 6 * scale);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#B71C1C';
  ctx.font = `${Math.round(10 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Crisis', x + width / 2, y + h / 2);
  ctx.restore();
};

module.exports = function soilTypeBadge(ctx, x, y, { width, scale }) {
  ctx.save();
  const h = 18 * scale;
  ctx.fillStyle = '#BCAAA4';
  ctx.strokeStyle = '#795548';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.roundRect(x, y, width, h, 6 * scale);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#4E342E';
  ctx.font = `${Math.round(10 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Soil', x + width / 2, y + h / 2);
  ctx.restore();
};

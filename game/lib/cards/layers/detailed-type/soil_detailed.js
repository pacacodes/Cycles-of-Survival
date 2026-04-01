module.exports = function soilDetailedType(ctx, x, y, { width, scale, card }) {
  ctx.save();
  ctx.fillStyle = '#EFEBE9';
  ctx.strokeStyle = '#6D4C41';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.roundRect(x, y, width, 14 * scale, 4 * scale);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#4E342E';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((card.soilType || 'Soil Type'), x + width / 2, y + 7 * scale);
  ctx.restore();
};

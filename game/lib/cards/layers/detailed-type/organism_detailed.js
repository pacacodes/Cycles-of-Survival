module.exports = function organismDetailedType(ctx, x, y, { width, scale, card }) {
  ctx.save();
  ctx.fillStyle = '#E8F5E9';
  ctx.strokeStyle = '#2E7D32';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.roundRect(x, y, width, 14 * scale, 4 * scale);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1B5E20';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((card.organismType || 'Organism Type'), x + width / 2, y + 7 * scale);
  ctx.restore();
};

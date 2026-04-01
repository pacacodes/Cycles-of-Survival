module.exports = function crisisDetailedType(ctx, x, y, { width, scale, card }) {
  ctx.save();
  ctx.fillStyle = '#FFEBEE';
  ctx.strokeStyle = '#C62828';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.roundRect(x, y, width, 14 * scale, 4 * scale);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#B71C1C';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((card.crisisType || 'Crisis Type'), x + width / 2, y + 7 * scale);
  ctx.restore();
};

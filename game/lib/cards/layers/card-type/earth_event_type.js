module.exports = function earthEventTypeBadge(ctx, x, y, { width, scale }) {
  ctx.save();
  const h = 18 * scale;
  ctx.fillStyle = '#FFD27A';
  ctx.strokeStyle = '#EF6C00';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.roundRect(x, y, width, h, 6 * scale);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#E65100';
  ctx.font = `${Math.round(10 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Earth Event', x + width / 2, y + h / 2);
  ctx.restore();
};

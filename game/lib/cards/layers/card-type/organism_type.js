module.exports = function organismTypeBadge(ctx, x, y, { width, scale }) {
  ctx.save();
  const h = 18 * scale;
  ctx.fillStyle = '#A5D6A7';
  ctx.strokeStyle = '#388E3C';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.roundRect(x, y, width, h, 6 * scale);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1B5E20';
  ctx.font = `${Math.round(10 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Organism', x + width / 2, y + h / 2);
  ctx.restore();
};

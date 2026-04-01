module.exports = function earthEventPhoto(ctx, x, y, { width, height, scale }) {
  ctx.save();
  ctx.fillStyle = '#FFE7B0';
  ctx.strokeStyle = '#FB8C00';
  ctx.lineWidth = 2 * scale;
  ctx.fillRect(x, y, width, height * 0.5);
  ctx.strokeRect(x, y, width, height * 0.5);
  ctx.fillStyle = '#E65100';
  ctx.font = `${Math.round(12 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Earth Event Photo', x + width / 2, y + height * 0.25);
  ctx.restore();
};

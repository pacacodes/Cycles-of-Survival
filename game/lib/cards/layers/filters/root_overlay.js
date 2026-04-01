module.exports = function rootOverlay(ctx, x, y, { width, height, scale }) {
  ctx.save();
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 1 * scale;
  // Simple branching roots placeholder
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width / 2, y + height * 0.4);
  ctx.moveTo(x + width / 2, y + height * 0.2);
  ctx.lineTo(x + width * 0.3, y + height * 0.35);
  ctx.moveTo(x + width / 2, y + height * 0.25);
  ctx.lineTo(x + width * 0.7, y + height * 0.4);
  ctx.stroke();
  ctx.restore();
};

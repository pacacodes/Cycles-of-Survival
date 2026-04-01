module.exports = function dnaOverlay(ctx, x, y, { width, height, scale }) {
  ctx.save();
  ctx.strokeStyle = '#3949AB';
  ctx.lineWidth = 1.5 * scale;
  // Simple helix-like path placeholder
  ctx.beginPath();
  for (let i = 0; i <= 10; i++) {
    const px = x + (i / 10) * width;
    const py = y + (Math.sin(i) * 0.2 + 0.3) * height;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
};

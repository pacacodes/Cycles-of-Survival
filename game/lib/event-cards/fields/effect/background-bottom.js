// Effect field: bottom background (functional-category style)
module.exports = function drawEffectBackgroundBottom(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, opacity, topH) {
  const gapY = ry + topH + 5; // 5px gap
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(rx, gapY);
  ctx.lineTo(rx + rw, gapY);
  ctx.lineTo(rx + rw, ry + rh - boxRadius);
  ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - boxRadius, ry + rh);
  ctx.lineTo(rx + boxRadius, ry + rh);
  ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - boxRadius);
  ctx.lineTo(rx, gapY);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, opacity);
  ctx.fill();
  ctx.restore();
};

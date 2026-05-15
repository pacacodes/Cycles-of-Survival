// Effect field: top background (functional-category style)
module.exports = function drawEffectBackgroundTop(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, opacity) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(rx + boxRadius, ry);
  ctx.lineTo(rx + rw - boxRadius, ry);
  ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + boxRadius);
  ctx.lineTo(rx + rw, ry + rh / 2);
  ctx.lineTo(rx, ry + rh / 2);
  ctx.lineTo(rx, ry + boxRadius);
  ctx.quadraticCurveTo(rx, ry, rx + boxRadius, ry);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, opacity);
  ctx.fill();
  ctx.restore();
};

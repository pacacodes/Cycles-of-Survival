// Organisms field: bottom background
module.exports = function drawOrganismsBackgroundBottom(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, opacity) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(rx, ry + rh / 2 - 1 + 5);
  ctx.lineTo(rx + rw, ry + rh / 2 - 1 + 5);
  ctx.lineTo(rx + rw, ry + rh - boxRadius);
  ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - boxRadius, ry + rh);
  ctx.lineTo(rx + boxRadius, ry + rh);
  ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - boxRadius);
  ctx.lineTo(rx, ry + rh / 2 - 1);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, opacity);
  ctx.fill();
  ctx.restore();
};

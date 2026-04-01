// Trophic Level top background for split effect
module.exports = function drawTrophicLevelBackgroundTop(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, opacity) {
  ctx.save();
  ctx.beginPath();
  // Top left outer corner (rounded)
  ctx.moveTo(rx + boxRadius, ry);
  ctx.lineTo(rx + rw - boxRadius, ry);
  // Top right outer corner (rounded)
  ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + boxRadius);
  // Right inner corner (90deg)
  ctx.lineTo(rx + rw, ry + rh / 2);
  // Left inner corner (90deg)
  ctx.lineTo(rx, ry + rh / 2);
  // Top left outer corner (rounded)
  ctx.lineTo(rx, ry + boxRadius);
  ctx.quadraticCurveTo(rx, ry, rx + boxRadius, ry);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, opacity);
  ctx.fill();
  ctx.restore();
};

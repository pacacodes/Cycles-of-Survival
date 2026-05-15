// Periods field: bottom background for split effect
module.exports = function drawPeriodsBackgroundBottom(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, opacity, topH) {
  const gapY = ry + topH + 5; // 5px gap
  ctx.save();
  ctx.beginPath();
  // Left inner corner (90deg)
  ctx.moveTo(rx, gapY);
  // Right inner corner (90deg)
  ctx.lineTo(rx + rw, gapY);
  // Bottom right outer corner (rounded)
  ctx.lineTo(rx + rw, ry + rh - boxRadius);
  ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - boxRadius, ry + rh);
  // Bottom left outer corner (rounded)
  ctx.lineTo(rx + boxRadius, ry + rh);
  ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - boxRadius);
  ctx.lineTo(rx, gapY);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, opacity);
  ctx.fill();
  ctx.restore();
};

// Functional Category bottom background for split effect
module.exports = function drawFunctionalCategoryBackgroundBottom(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, opacity) {
  ctx.save();
  ctx.beginPath();
  // Left inner corner (90deg)
  ctx.moveTo(rx, ry + rh / 2 - 1 + 5);
  // Right inner corner (90deg)
  ctx.lineTo(rx + rw, ry + rh / 2 - 1 + 5);
  // Bottom right outer corner (rounded)
  ctx.lineTo(rx + rw, ry + rh - boxRadius);
  ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - boxRadius, ry + rh);
  // Bottom left outer corner (rounded)
  ctx.lineTo(rx + boxRadius, ry + rh);
  ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - boxRadius);
  ctx.lineTo(rx, ry + rh / 2 - 1);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, opacity);
  ctx.fill();
  ctx.restore();
};

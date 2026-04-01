// Draw a thin connector line with arrowhead from badge to field
// Draw a 3-segment connector: 45-degree out, vertical, 45-degree in
module.exports = function drawConnectorLine(ctx, startX, startY, endX, endY, scale, color = '#222', backgroundRightX = null) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5 * scale;
  ctx.beginPath();
  // 1. 45-degree out from badge (right and down)
  const dx = endX - startX;
  const dy = endY - startY;
  // Always go right and down (or up) at 45deg for a fixed length
  const segLen = 0.18 * 72 * scale; // same as badge diameter
  const outX = startX + segLen * Math.SQRT1_2 * Math.sign(dx);
  const outY = startY + segLen * Math.SQRT1_2 * Math.sign(dy);
  // 2. Vertical segment (aligned with endY)
  const vertX = outX;
  const vertY = endY - segLen * Math.SQRT1_2 * Math.sign(dy);
  // 3. Extend third segment to the right edge of the background
  ctx.moveTo(startX, startY);
  ctx.lineTo(outX, outY);
  ctx.lineTo(vertX, vertY);
  let seg3X = vertX + 80; // 20px (previous) + 60px (additional)
  if (backgroundRightX !== null) {
    seg3X = backgroundRightX + 60;
  }
  const seg3Y = vertY;
  ctx.lineTo(seg3X, seg3Y);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.restore();
};

module.exports = function drawCropMarksPNG(ctx, xPt, yPt, wPt, hPt, scale) {
  const markLenPt = 8;
  const offsetPt = 0;
  const x = xPt * scale;
  const y = yPt * scale;
  const w = wPt * scale;
  const h = hPt * scale;
  const markLen = markLenPt * scale;
  const offset = offsetPt * scale;
  ctx.save();
  ctx.lineWidth = 0.5 * scale;
  ctx.strokeStyle = '#000000';
  // Top-left
  ctx.beginPath(); ctx.moveTo(x - offset, y); ctx.lineTo(x - offset - markLen, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - offset); ctx.lineTo(x, y - offset - markLen); ctx.stroke();
  // Top-right
  ctx.beginPath(); ctx.moveTo(x + w + offset, y); ctx.lineTo(x + w + offset + markLen, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + w, y - offset); ctx.lineTo(x + w, y - offset - markLen); ctx.stroke();
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(x - offset, y + h); ctx.lineTo(x - offset - markLen, y + h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y + h + offset); ctx.lineTo(x, y + h + offset + markLen); ctx.stroke();
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(x + w + offset, y + h); ctx.lineTo(x + w + offset + markLen, y + h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + w, y + h + offset); ctx.lineTo(x + w, y + h + offset + markLen); ctx.stroke();
  ctx.restore();
};

/**
 * Draws the Effect field row
 */
module.exports = function drawEffectField(ctx, { textX, rowY, scale, color, titleColor, main, sub, maxWidth, hexToRgba, drawTop, drawBottom }) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = titleColor || '#000000';

  const fieldSize = Math.round(4.5 * scale);
  const subSize   = Math.round(4.5 * scale);
  const boxPadX   = 4 * scale;
  const boxPadY   = 2 * scale;
  const boxRadius = 6 * scale;
  const lineGap   = Math.round(2 * scale);
  const subY      = rowY + fieldSize + lineGap;

  const displayLabel = 'EFFECT';
  const displaySub = sub ? sub.toLowerCase() : null;

  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  const labelPart = `${displayLabel} : `;
  const labelPartW = ctx.measureText(labelPart).width;
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  const mainW = ctx.measureText(main).width;
  let subW = 0;
  if (displaySub) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    subW = ctx.measureText(displaySub).width;
  }
  const line1W = labelPartW + mainW;
  const contentW = maxWidth ? Math.min(Math.max(line1W, subW), maxWidth) : Math.max(line1W, subW);
  const boxH = fieldSize + (displaySub ? lineGap + subSize : 0) + 2 * boxPadY;
  const boxW = contentW + 2 * boxPadX;

  ctx.save();
  drawTop(ctx, textX - boxPadX, rowY - boxPadY, boxW, boxH, boxRadius, color, hexToRgba, 0.45);
  drawBottom(ctx, textX - boxPadX, rowY - boxPadY, boxW, boxH, boxRadius, color, hexToRgba, 0.8);
  ctx.restore();

  ctx.beginPath();
  ctx.rect(textX - boxPadX, rowY - boxPadY, boxW, boxH);
  ctx.clip();

  ctx.shadowColor = '#FFFFFF';
  ctx.shadowBlur = 10 * scale;
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  ctx.fillText(labelPart, textX, rowY);
  ctx.fillText(main, textX + labelPartW, rowY);

  if (displaySub) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    ctx.fillText(displaySub, textX, subY);
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();

  return {
    height: boxH + Math.round(4 * scale)
  };
};

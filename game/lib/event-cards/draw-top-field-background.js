/**
 * Draw the top background of an event card field with centered title and subtitle
 * Specific implementation for event cards
 */

module.exports = function drawTopFieldBackground(ctx, {
  textX,
  rowY,
  scale,
  color,
  titleColor,
  label,
  main,
  maxWidth = 200,
  extraWidth = 0,
  boxRadius,
  boxPadX,
  boxPadY,
  fieldSize,
  hexToRgba,
  drawTop
}) {
  // Normalize and format label
  const displayLabel = label.toUpperCase();
  const labelPart = `${displayLabel} : `;
  const line1 = labelPart + main;
  
  // Measure for width calculation
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  const line1W = ctx.measureText(line1).width;
  
  // Calculate box width
  const boxW = Math.max(line1W, maxWidth) + 2 * boxPadX + extraWidth;
  
  // Calculate top background height
  const topBoxH = (fieldSize * 2) + (boxPadY * 3) + Math.round(2 * scale);

  // Draw TOP background (fixed height, light/transparent)
  ctx.save();
  drawTop(ctx, textX - boxPadX, rowY - boxPadY, boxW, topBoxH, boxRadius, color, hexToRgba, 0.45);
  ctx.restore();

  // Draw text in TOP background (centered vertically)
  const topBgTop = rowY - boxPadY;
  const topBgCenter = topBgTop + (topBoxH / 2);
  const topTextStartY = topBgCenter - (fieldSize / 2) - 15; // Move up 15px for better centering
  
  ctx.shadowColor = '#FFFFFF';
  ctx.shadowBlur = 10 * scale;
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = titleColor || '#000000';
  
  // Single line: Label and main value together
  ctx.fillText(line1, textX, topTextStartY);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Return dimensions for caller
  return {
    boxW,
    topBoxH,
    topBgTop,
    boxRadius
  };
};

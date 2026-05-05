/**
 * Draw description text in the bottom background of an event card field
 * Positioned with control for easy adjustments
 */

const wrapText = require('./wrap-text');

module.exports = function drawDescriptionText(ctx, {
  textX,
  wrappedLines,
  bottomBgTop,
  bottomBoxH,
  subSize,
  lineGap,
  titleColor,
  label,
  textOffsetY = 0  // Additional offset for positioning
}) {
  if (wrappedLines.length === 0) {
    return;
  }

  ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = titleColor || '#000000';
  
  // Apply extra offset for EFFECT field description text only
  const fieldSpecificOffset = label === 'Effect' ? 30 : 0;
  const totalTextOffset = textOffsetY + fieldSpecificOffset;
  
  // Center description vertically in bottom background with optional offset
  const totalDescHeight = wrappedLines.length * (subSize + lineGap) - lineGap;
  const bottomBgCenter = bottomBgTop + (bottomBoxH / 2);
  const descStartY = bottomBgCenter - (totalDescHeight / 2) + totalTextOffset;
  
  wrappedLines.forEach((line, i) => {
    ctx.fillText(line, textX, descStartY + (i * (subSize + lineGap)));
  });
};

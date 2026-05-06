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
  
  // Position text at fixed offset from bottom background top (not centered)
  const descStartY = bottomBgTop + textOffsetY;
  
  wrappedLines.forEach((line, i) => {
    ctx.fillText(line, textX, descStartY + (i * (subSize + lineGap)));
  });
};

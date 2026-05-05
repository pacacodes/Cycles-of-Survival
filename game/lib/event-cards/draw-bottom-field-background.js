/**
 * Draw the bottom background of an event card field
 * Specific implementation for event cards
 */

const wrapText = require('./wrap-text');
const drawDescriptionText = require('./draw-description-text');

module.exports = function drawBottomFieldBackground(ctx, {
  textX,
  rowY,
  scale,
  color,
  titleColor,
  sub,
  topBoxH,
  topBgTop,
  boxW,
  boxRadius,
  boxPadX,
  boxPadY,
  subSize,
  maxWidth = 200,
  hexToRgba,
  drawBottom
}) {
  const lineGap = Math.round(2 * scale);
  
  // Normalize description text
  const displaySub = sub ? sub.toLowerCase().replace(/\bma\b/g, 'Ma').replace(/\bga\b/g, 'Ga') : null;
  
  // Gap between top and bottom backgrounds - move bottom background up to completely overlap
  const gapBetweenBackgrounds = -15; // Negative value moves bottom up to eliminate white strip
  
  // Wrap text and calculate bottom background height (taller to hold all text)
  let wrappedLines = [];
  let bottomBoxH = boxPadY * 2 + 20; // Add 20px extra height
  
  if (displaySub) {
    const wrapMaxWidth = maxWidth || 200;
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    wrappedLines = wrapText(ctx, displaySub, wrapMaxWidth, subSize);
    bottomBoxH = (wrappedLines.length * (subSize + lineGap)) + (boxPadY * 2) + 20; // 20px extra height
  }

  // Draw BOTTOM background (variable height, dark/opaque, with consistent gap)
  const bottomBgTop = topBgTop + topBoxH + gapBetweenBackgrounds;
  
  ctx.save();
  drawBottom(ctx, textX - boxPadX, bottomBgTop, boxW, bottomBoxH, boxRadius, color, hexToRgba, 0.8);
  ctx.restore();

  // Draw description text in BOTTOM background (with easy positioning control)
  drawDescriptionText(ctx, {
    textX,
    wrappedLines,
    bottomBgTop,
    bottomBoxH,
    subSize,
    lineGap,
    titleColor,
    textOffsetY: 10  // Move text down 10px
  });

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Return dimensions for caller
  return {
    bottomBoxH
  };
};

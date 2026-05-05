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
  label,
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
  drawBottom,
  extraBottomOffset = 0
}) {
  const lineGap = Math.round(2 * scale);
  
  // Normalize description text
  const displaySub = sub ? sub.toLowerCase().replace(/\bma\b/g, 'Ma').replace(/\bga\b/g, 'Ga') : null;
  
  // Gap between top and bottom backgrounds - move bottom background up to completely overlap
  const gapBetweenBackgrounds = -55; // Negative value moves bottom up to overlap (40px more)
  
  // Apply extra field-specific offset (e.g., EFFECT field gets moved up 30px more)
  const totalBottomOffset = gapBetweenBackgrounds + extraBottomOffset;
  
  // Wrap text and calculate bottom background height (taller to hold all text)
  let wrappedLines = [];
  let bottomBoxH = boxPadY * 2 + 20; // Add 20px extra height
  
  if (displaySub) {
    const wrapMaxWidth = maxWidth || 200;
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    wrappedLines = wrapText(ctx, displaySub, wrapMaxWidth, subSize);
    bottomBoxH = (wrappedLines.length * (subSize + lineGap)) + (boxPadY * 2) + 20; // 20px extra height
  }

  // Draw BOTTOM background (variable height, dark/opaque, with consistent gap and field-specific offset)
  const bottomBgTop = topBgTop + topBoxH + totalBottomOffset;
  
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
    label,
    textOffsetY: 10  // Move text down 10px
  });

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Return dimensions for caller
  return {
    bottomBoxH
  };
};

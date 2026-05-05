/**
 * Draw a single event card field row with split backgrounds
 * Specific implementation for event cards (separate from organism cards)
 */

const drawTopFieldBackground = require('./draw-top-field-background');
const drawBottomFieldBackground = require('./draw-bottom-field-background');

module.exports = function drawFieldRow(ctx, { textX, rowY, scale, color, titleColor, label, main, sub, maxWidth, hexToRgba, drawTop, drawBottom, extraWidth = 0, extraBottomOffset = 0 }) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = titleColor || '#000000';

  const fieldSize = Math.round(4.5 * scale);
  const subSize   = Math.round(4.5 * scale);
  const boxPadX   = 4 * scale;
  const boxPadY   = 2 * scale;
  const boxRadius = 6 * scale;

  // Draw TOP background and text
  const topResult = drawTopFieldBackground(ctx, {
    textX,
    rowY,
    scale,
    color,
    titleColor,
    label,
    main,
    maxWidth,
    extraWidth,
    boxRadius,
    boxPadX,
    boxPadY,
    fieldSize,
    hexToRgba,
    drawTop
  });

  // Draw BOTTOM background and text
  drawBottomFieldBackground(ctx, {
    textX,
    rowY,
    scale,
    color,
    titleColor,
    label,
    sub,
    topBoxH: topResult.topBoxH,
    topBgTop: topResult.topBgTop,
    boxW: topResult.boxW,
    boxRadius: topResult.boxRadius,
    boxPadX,
    boxPadY,
    subSize,
    maxWidth,
    hexToRgba,
    drawBottom,
    extraBottomOffset
  });

  ctx.restore();
};

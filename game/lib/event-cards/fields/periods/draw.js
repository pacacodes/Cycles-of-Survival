/**
 * Draws a single periods field row: split background + "PERIODS : value" on one line,
 * optional timespan description on the line below in smaller text.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} opts
 *   textX        - left x position for text
 *   rowY         - top y position for this row
 *   scale        - render scale factor
 *   color        - hex color for background
 *   titleColor   - hex color for text
 *   main         - main value string (e.g. "Quaternary, Holocene")
 *   sub          - optional timespan description (e.g. "2.6 Ma – Present")
 *   maxWidth     - optional max pixel width for text before ellipsis truncation
 *   hexToRgba    - helper fn from field-helpers
 *   drawTop      - background-top draw fn
 *   drawBottom   - background-bottom draw fn
 */
const measureTextLines = require('../../lib/measure-text-lines');

module.exports = function drawPeriodsField(ctx, { textX, rowY, scale, color, titleColor, main, sub, maxWidth, hexToRgba, drawTop, drawBottom }) {
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

  // Normalize label and sub
  const displayLabel = 'PERIODS';
  const displaySub = sub ? sub.toLowerCase().replace(/\bma\b/g, 'Ma').replace(/\bga\b/g, 'Ga') : null;

  // Measure main text lines
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  const labelPart = `${displayLabel} : `;
  const labelPartW = ctx.measureText(labelPart).width;
  const mainAvailWidth = maxWidth ? maxWidth - labelPartW : undefined;
  const mainLineCount = mainAvailWidth ? measureTextLines(ctx, main, mainAvailWidth) : 1;
  
  // Measure sub text lines
  let subLineCount = 0;
  if (displaySub) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    subLineCount = maxWidth ? measureTextLines(ctx, displaySub, maxWidth) : 1;
  }

  // Measure widths for background box
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  const mainW = ctx.measureText(main).width;
  let subW = 0;
  if (displaySub) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    subW = ctx.measureText(displaySub).width;
  }
  const line1W = labelPartW + mainW;
  const contentW = maxWidth ? Math.min(Math.max(line1W, subW), maxWidth) : Math.max(line1W, subW);

  // Calculate height: top is always exactly 8px, bottom expands based on content
  const topH = Math.round(8 * scale); // Constant 8px top
  const bottomH = Math.round(8 * scale * (subLineCount || 1)); // 8px per line of period timespan
  const boxH = topH + 5 + bottomH; // 5 is the gap
  const boxW = contentW + 2 * boxPadX;
  const subY = rowY + fieldSize + lineGap;

  // Background (isolated save/restore)
  ctx.save();
  drawTop(ctx, textX - boxPadX, rowY - boxPadY, boxW, boxH, boxRadius, color, hexToRgba, 0.45, topH);
  drawBottom(ctx, textX - boxPadX, rowY - boxPadY, boxW, boxH, boxRadius, color, hexToRgba, 0.8, topH);
  ctx.restore();

  // Clip text to within the background box so it never overflows
  ctx.beginPath();
  ctx.rect(textX - boxPadX, rowY - boxPadY, boxW, boxH);
  ctx.clip();

  ctx.shadowColor = '#FFFFFF';
  ctx.shadowBlur = 10 * scale;
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  ctx.fillText(labelPart, textX, rowY);
  ctx.fillText(main, textX + labelPartW, rowY);

  // Line 2: sub description, smaller
  if (displaySub) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    ctx.fillText(displaySub, textX, subY);
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();

  // Return field height for layout purposes
  return {
    height: boxH + Math.round(4 * scale) // height + gap
  };
};


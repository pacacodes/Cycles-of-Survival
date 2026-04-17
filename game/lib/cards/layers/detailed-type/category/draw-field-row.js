/**
 * Draws a single card info row: split background + "Bold Label: value" on one line,
 * optional sub description on the line below in smaller text.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} opts
 *   textX        - left x position for text
 *   rowY         - top y position for this row
 *   scale        - render scale factor
 *   color        - hex color for background
 *   titleColor   - hex color for text
 *   label        - bold header string (e.g. "Organism Type")
 *   main         - main value string (e.g. "Terrestrial Vertebrates")
 *   sub          - optional description shown smaller on next line
 *   maxWidth     - optional max pixel width for text before ellipsis truncation
 *   hexToRgba    - helper fn from field-helpers
 *   drawTop      - background-top draw fn
 *   drawBottom   - background-bottom draw fn
 */
module.exports = function drawFieldRow(ctx, { textX, rowY, scale, color, titleColor, label, main, sub, maxWidth, hexToRgba, drawTop, drawBottom }) {
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

  // Normalize label (ALL CAPS) and sub (lowercase, preserve Ma/Ga)
  const displayLabel = label.toUpperCase();
  const displaySub = sub ? sub.toLowerCase().replace(/\bma\b/g, 'Ma').replace(/\bga\b/g, 'Ga') : null;

  // Measure widths for background box
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

  // Background (isolated save/restore)
  ctx.save();
  drawTop(ctx, textX - boxPadX, rowY - boxPadY, boxW, boxH, boxRadius, color, hexToRgba, 0.45);
  drawBottom(ctx, textX - boxPadX, rowY - boxPadY, boxW, boxH, boxRadius, color, hexToRgba, 0.8);
  ctx.restore();

  // Clip text to within the background box so it never overflows
  ctx.beginPath();
  ctx.rect(textX - boxPadX, rowY - boxPadY, boxW, boxH);
  ctx.clip();

  // Line 1: "Bold Label: " then bold "Main Value"
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
};


/**
 * Draw a single event card field row with split backgrounds
 * Uses the same logic as organism cards for consistent appearance
 */

const wrapText = require('./wrap-text');

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
  let wrappedSubLines = [];
  if (displaySub) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    // If maxWidth is set, wrap the text to calculate actual line count
    if (maxWidth) {
      wrappedSubLines = wrapText(ctx, displaySub, maxWidth, subSize);
      subW = maxWidth;
    } else {
      subW = ctx.measureText(displaySub).width;
      wrappedSubLines = [displaySub]; // Single line if no wrapping needed
    }
  }
  const line1W = labelPartW + mainW;
  const contentW = maxWidth ? Math.min(Math.max(line1W, subW), maxWidth) : Math.max(line1W, subW);
  
  // Top background: label line plus ~2px below
  const topBoxH = fieldSize + (7 * scale) + 2 * boxPadY;
  
  // Bottom background: starts 2px above first wrapped line, ends 2px below last line
  const bottomBoxH = displaySub ? ((wrappedSubLines.length - 1) * (subSize + lineGap) + subSize + (4 * scale)) : 0;
  
  const boxW = contentW + 2 * boxPadX;

  // Background (isolated save/restore)
  ctx.save();
  drawTop(ctx, textX - boxPadX, rowY - boxPadY, boxW, topBoxH, boxRadius, color, hexToRgba, 0.45);
  ctx.restore();

  // Draw bottom background if there's sub text
  if (bottomBoxH > 0) {
    ctx.save();
    const bottomY = subY - (2 * scale);
    drawBottom(ctx, textX - boxPadX, bottomY, boxW, bottomBoxH, boxRadius, color, hexToRgba, 0.8);
    ctx.restore();
  }

  // Clip text to within both background boxes so it never overflows
  ctx.beginPath();
  ctx.rect(textX - boxPadX, rowY - boxPadY, boxW, topBoxH + bottomBoxH + (2 * scale));
  ctx.clip();

  // Line 1: "Bold Label: " then bold "Main Value"
  ctx.shadowColor = '#FFFFFF';
  ctx.shadowBlur = 10 * scale;
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  ctx.fillText(labelPart, textX, rowY);
  ctx.fillText(main, textX + labelPartW, rowY);

  // Lines 2+: wrapped sub description, smaller
  if (wrappedSubLines.length > 0) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    wrappedSubLines.forEach((line, i) => {
      ctx.fillText(line, textX, subY + (i * (subSize + lineGap)));
    });
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();

  // Return total field height (top + bottom + spacing)
  const totalFieldHeight = topBoxH + bottomBoxH;
  return {
    height: totalFieldHeight
  };
};

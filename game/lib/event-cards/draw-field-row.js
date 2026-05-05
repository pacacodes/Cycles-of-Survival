/**
 * Draw a single event card field row with split backgrounds
 * Specific implementation for event cards (separate from organism cards)
 */

function wrapText(ctx, text, maxWidth, fontSize) {
  // First, split by newlines
  const paragraphs = text.split('\n');
  const lines = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    
    // Then wrap each paragraph by word
    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

module.exports = function drawFieldRow(ctx, { textX, rowY, scale, color, titleColor, label, main, sub, maxWidth, hexToRgba, drawTop, drawBottom, extraWidth = 0 }) {
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

  // Normalize label (ALL CAPS)
  const displayLabel = label.toUpperCase();
  const displaySub = sub ? sub.toLowerCase().replace(/\bma\b/g, 'Ma').replace(/\bga\b/g, 'Ga') : null;

  // Fixed top background height - tall enough for label and main subtitle with padding
  const topBoxH = (fieldSize * 2) + (boxPadY * 3) + Math.round(2 * scale);
  
  // Calculate description wrapping for bottom background
  let wrappedLines = [];
  let bottomBoxH = boxPadY * 2;
  
  if (displaySub) {
    const wrapMaxWidth = maxWidth || 200;
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    wrappedLines = wrapText(ctx, displaySub, wrapMaxWidth, subSize);
    bottomBoxH = (wrappedLines.length * (subSize + lineGap)) + (boxPadY * 2);
  }

  // Measure label + main for top background width (both on same line)
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  const labelPart = `${displayLabel} : `;
  const line1 = labelPart + main;
  const line1W = ctx.measureText(line1).width;
  
  // Calculate box width (fixed for both top and bottom)
  const boxW = Math.max(line1W, (maxWidth || 200)) + 2 * boxPadX + extraWidth;

  // Draw TOP background (fixed height)
  ctx.save();
  drawTop(ctx, textX - boxPadX, rowY - boxPadY, boxW, topBoxH, boxRadius, color, hexToRgba, 0.45);
  ctx.restore();

  // Draw BOTTOM background (variable height, same width, positioned right below top with minimal gap)
  ctx.save();
  drawBottom(ctx, textX - boxPadX, rowY - boxPadY + topBoxH - 1 * scale, boxW, bottomBoxH, boxRadius, color, hexToRgba, 0.8);
  ctx.restore();

  // Draw text in TOP background (label and main on same line, centered vertically)
  const topBgTop = rowY - boxPadY;
  const topBgCenter = topBgTop + (topBoxH / 2);
  const topTextStartY = topBgCenter - (fieldSize / 2);
  
  ctx.shadowColor = '#FFFFFF';
  ctx.shadowBlur = 10 * scale;
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = titleColor || '#000000';
  
  // Single line: Label and main value together (e.g., "EFFECT : Event Impact")
  ctx.fillText(line1, textX, topTextStartY);

  // Draw description text in BOTTOM background (wrapped and centered)
  if (wrappedLines.length > 0) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    ctx.fillStyle = titleColor || '#000000';
    
    // Center description vertically in bottom background
    const bottomBgTop = rowY - boxPadY + topBoxH - 1 * scale;
    const totalDescHeight = wrappedLines.length * (subSize + lineGap) - lineGap;
    const bottomBgCenter = bottomBgTop + (bottomBoxH / 2);
    const descStartY = bottomBgCenter - (totalDescHeight / 2);
    
    wrappedLines.forEach((line, i) => {
      ctx.fillText(line, textX, descStartY + (i * (subSize + lineGap)));
    });
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();
};

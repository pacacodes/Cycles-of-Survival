/**
 * Draw a single event card field row with split backgrounds
 * Uses the same logic as organism cards for consistent appearance
 */

const wrapText = require('./wrap-text');

module.exports = function drawFieldRow(ctx, { textX, rowY, scale, color, titleColor, label, main, sub, maxWidth, hexToRgba, drawTop, drawBottom, eventName }) {
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
  
  // For Effect field, calculate adjusted row position (moved up 0.5px)
  const adjustedRowY = label === 'Effect' ? rowY - (0.5 * scale) : rowY;
  const subY      = adjustedRowY + fieldSize + lineGap;

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
  
  // Calculate box width and reduce by 20px to make fields narrower
  const boxW = contentW + 2 * boxPadX - (20 * scale);
  
  // For Effect field, add 10px to the right
  const effectBoxW = label === 'Effect' ? boxW + (10 * scale) : boxW;
  
  // Calculate actual available width for text within the bottom background
  const boxWForWidth = label === 'Effect' ? effectBoxW : boxW;
  const actualTextWidth = boxWForWidth - 2 * boxPadX;
  
  // Re-wrap text using actual available width within the background box
  if (displaySub && actualTextWidth > 0) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    wrappedSubLines = wrapText(ctx, displaySub, actualTextWidth, subSize);
  }
  
  // Top background: label line plus ~2px below
  const topBoxH = fieldSize + (7 * scale) + 2 * boxPadY;
  
  // Bottom background: covers all wrapped lines with proper padding
  let bottomBoxH = 0;
  if (displaySub && wrappedSubLines.length > 0) {
    // Calculate minimum height needed to contain all wrapped text
    const textLineHeight = wrappedSubLines.length * subSize;
    const textGapHeight = Math.max(0, wrappedSubLines.length - 1) * lineGap;
    const requiredHeight = textLineHeight + textGapHeight + (4 * scale); // padding top and bottom
    
    if (label === 'Effect') {
      // Effect field: double the required height to cover all description text
      bottomBoxH = Math.max(requiredHeight * 2, ((2 * scale) + (wrappedSubLines.length * (subSize + lineGap)) - lineGap + (2 * scale)) * 2);
    } else if (label === 'Biomes') {
      // Biomes field: use required height or calculated height, whichever is larger, plus 17.5px extra (5px bottom + 12.5px top)
      bottomBoxH = Math.max(requiredHeight, ((wrappedSubLines.length * (subSize + lineGap)) - lineGap + (4 * scale) + 2 * boxPadY)) + (17.5 * scale);
    } else if (label === 'Organisms') {
      // Organisms field: use required height or calculated height, whichever is larger, plus 10.5px extra at bottom
      bottomBoxH = Math.max(requiredHeight, ((wrappedSubLines.length * (subSize + lineGap)) - lineGap + (4 * scale) + 2 * boxPadY)) + (10.5 * scale);
    } else {
      // Other fields: use required height or calculated height, whichever is larger
      bottomBoxH = Math.max(requiredHeight, ((wrappedSubLines.length * (subSize + lineGap)) - lineGap + (4 * scale) + 2 * boxPadY));
    }
  }

  // Background (isolated save/restore)
  ctx.save();
  const topBoxW = label === 'Effect' ? effectBoxW : boxW;
  drawTop(ctx, textX - boxPadX, adjustedRowY - boxPadY, topBoxW, topBoxH, boxRadius, color, hexToRgba, 0.45);
  ctx.restore();

  // Draw bottom background if there's sub text
  if (bottomBoxH > 0) {
    ctx.save();
    // For Effect field, move bottom background up 30px, down 1px, then up 7px
    // For Biomes and Organisms fields, move bottom background up 30px, down 1px, then down 15px
    let bottomY;
    
    // List of events that need 10px additional downward adjustment for Effect field
    const needsAdjustment = eventName && ['Prolonged Drought', 'Megaflood', 'Disease Outbreak', 'Invasive Species Arrival', 'Predator Boom', 'Volcanic Eruption (Regional)', 'Oxygen Crash (Local)', 'Late Devonian Mass Extinction', 'Refugia Discovered', 'Oxygen Surge'].includes(eventName);
    
    if (label === 'Effect') {
      bottomY = rowY - boxPadY + topBoxH - (30 * scale) + (1 * scale) - (7 * scale);
      if (needsAdjustment) {
        bottomY += (6 * scale);
      }
    } else if (label === 'Biomes') {
      bottomY = rowY - boxPadY + topBoxH - (30 * scale) + (1 * scale) + (15 * scale) - (15.5 * scale);
    } else if (label === 'Organisms') {
      bottomY = rowY - boxPadY + topBoxH - (30 * scale) + (1 * scale) + (15 * scale) - (8.5 * scale);
    } else {
      bottomY = rowY - boxPadY + topBoxH;
    }
    const bottomBoxW = label === 'Effect' ? effectBoxW : boxW;
    drawBottom(ctx, textX - boxPadX, bottomY, bottomBoxW, bottomBoxH, boxRadius, color, hexToRgba, 0.8);
    ctx.restore();
  }

  // Calculate total clipping height to account for overlapping/offset bottom boxes
  let totalClipHeight = topBoxH + bottomBoxH;
  if (bottomBoxH > 0) {
    if (label === 'Effect') {
      // Effect box overlaps - calculate actual extent
      const effectBottomEnd = topBoxH - (30 * scale) + (1 * scale) + bottomBoxH;
      totalClipHeight = Math.max(topBoxH + bottomBoxH, effectBottomEnd);
    } else if (label === 'Biomes' || label === 'Organisms') {
      // Biomes/Organisms box overlaps - calculate actual extent
      const otherBottomEnd = topBoxH - (30 * scale) + (1 * scale) + (15 * scale) + bottomBoxH;
      totalClipHeight = Math.max(topBoxH + bottomBoxH, otherBottomEnd);
    }
  }

  // Clip text to within both background boxes so it never overflows
  const clipBoxW = label === 'Effect' ? effectBoxW : boxW;
  ctx.beginPath();
  ctx.rect(textX - boxPadX, rowY - boxPadY, clipBoxW, totalClipHeight);
  ctx.clip();

  // Line 1: "Bold Label: " then bold "Main Value"
  ctx.shadowColor = '#FFFFFF';
  ctx.shadowBlur = 10 * scale;
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  ctx.fillText(labelPart, textX, adjustedRowY);
  ctx.fillText(main, textX + labelPartW, adjustedRowY);

  // Lines 2+: wrapped sub description, smaller
  if (wrappedSubLines.length > 0) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    // For Effect, Biomes, and Organisms fields, move text down 1px
    const textYOffset = (label === 'Effect' || label === 'Biomes' || label === 'Organisms') ? (1 * scale) : 0;
    wrappedSubLines.forEach((line, i) => {
      ctx.fillText(line, textX, subY + (i * (subSize + lineGap)) + textYOffset);
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

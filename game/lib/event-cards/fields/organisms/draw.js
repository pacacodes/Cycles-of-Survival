/**
 * Draws the Organisms field row
 */
const measureTextLines = require('../../lib/measure-text-lines');

module.exports = function drawOrganismsField(ctx, { textX, rowY, scale, color, titleColor, main, sub, maxWidth, hexToRgba, drawTop, drawBottom }) {
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

  const displayLabel = 'ORGANISMS';
  const displaySub = sub ? sub.toLowerCase() : null;

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

  // Calculate content width
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  const mainW = ctx.measureText(main).width;
  let subW = 0;
  if (displaySub) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    subW = ctx.measureText(displaySub).width;
  }
  const line1W = labelPartW + mainW;
  const contentW = maxWidth ? Math.min(Math.max(line1W, subW), maxWidth) : Math.max(line1W, subW);

  // Calculate heights: top is always exactly 8px, bottom is 8px per line of description
  const topH = Math.round(8 * scale); // Constant 8px top
  const bottomH = Math.round(8 * scale * subLineCount); // 8px per line of organism list
  const boxH = topH + 5 + bottomH; // 5 is the gap
  const boxW = contentW + 2 * boxPadX;
  
  // Calculate content height for sub text to center vertically in bottom background
  const subContentHeight = displaySub ? (subLineCount * subSize + (subLineCount - 1) * lineGap) : 0;
  const bottomBackgroundStart = rowY + topH + 5; // After top background and gap
  const bottomMargin = Math.round(2 * scale); // Margin at bottom to prevent clipping
  const verticalOffset = displaySub ? Math.max(0, (bottomH - subContentHeight - bottomMargin) / 2) : 0;
  const subY = bottomBackgroundStart + verticalOffset;

  ctx.save();
  drawTop(ctx, textX - boxPadX, rowY - boxPadY, boxW, boxH, boxRadius, color, hexToRgba, 0.45, topH);
  drawBottom(ctx, textX - boxPadX, rowY - boxPadY, boxW, boxH, boxRadius, color, hexToRgba, 0.8, topH);
  ctx.restore();

  ctx.beginPath();
  ctx.rect(textX - boxPadX, rowY - boxPadY, boxW, boxH);
  ctx.clip();

  ctx.shadowColor = '#FFFFFF';
  ctx.shadowBlur = 10 * scale;
  
  // Draw main text (label and value)
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  ctx.fillText(labelPart, textX, rowY);
  ctx.fillText(main, textX + labelPartW, rowY);

  // Draw sub text (may wrap to multiple lines)
  if (displaySub) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    
    if (subLineCount > 1 && maxWidth) {
      const words = displaySub.split(' ');
      let currentY = subY;
      let currentLineText = '';
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLineText + (currentLineText ? ' ' : '') + word;
        const testW = ctx.measureText(testLine).width;
        
        if (testW > maxWidth && currentLineText) {
          // Current line is full, draw it
          ctx.fillText(currentLineText, textX, currentY);
          currentLineText = word;
          currentY += subSize + lineGap;
        } else {
          currentLineText = testLine;
        }
      }
      
      // Draw last line
      if (currentLineText) {
        ctx.fillText(currentLineText, textX, currentY);
      }
    } else {
      ctx.fillText(displaySub, textX, subY);
    }
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();

  return {
    height: boxH + Math.round(4 * scale)
  };
};

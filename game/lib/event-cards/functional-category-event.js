/**
 * Draw event card field sections
 * Renders the 3 event fields (EFFECT, BIOMES, ORGANISMS) with proper spacing
 * Separate implementation for event cards (does not affect organism cards)
 */

const drawFieldRow = require('./draw-field-row');
const { hexToRgba } = require('../cards/layers/detailed-type/category/field-helpers');

function getEventBackgroundFunctions() {
  return {
    drawTop: require('../cards/layers/detailed-type/category/functional-category-background-top'),
    drawBottom: require('../cards/layers/detailed-type/category/functional-category-background-bottom'),
  };
}

module.exports = function drawEventFields(ctx, contentX, contentY, contentW, contentH, card, scale) {
  // Get fields from card
  const fields = card._eventFields || [];
  if (!fields.length) return;

  const badgeRadius   = 0.18 * 72 * scale;
  const badgeTextGap  = 10 * scale;
  const leftPadding   = Math.round(21 * scale);
  const fieldGap      = Math.round(10 * scale);
  
  const color = card.neonColor;  // Event-type color
  const textX = contentX + leftPadding + badgeRadius + badgeTextGap;
  const maxTextWidth = contentW - leftPadding - badgeRadius - badgeTextGap - Math.round(8 * scale);

  const { drawTop, drawBottom } = getEventBackgroundFunctions();

  // Draw all fields with consistent spacing
  let currentY = contentY + Math.round(50 * scale);

  fields.forEach((field, index) => {
    drawFieldRow(ctx, {
      textX,
      rowY: currentY,
      scale,
      color,
      titleColor: card.titleColor,
      maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined,
      hexToRgba,
      drawTop,
      drawBottom,
      extraWidth: field.label === 'Effect' ? 20 : 0,
      ...field,
    });

    // Calculate total field height (fixed top + variable bottom)
    const fieldSize = Math.round(4.5 * scale);
    const subSize   = Math.round(4.5 * scale);
    const boxPadY   = 2 * scale;
    const lineGap   = Math.round(2 * scale);
    
    // Fixed top background height (tall enough for label + main subtitle)
    const topBoxH = (fieldSize * 2) + (boxPadY * 3) + Math.round(2 * scale);
    
    // Calculate bottom background height based on description wrapping
    let bottomBoxH = boxPadY * 2;
    if (field.sub) {
      // Estimate wrapped lines
      const estimatedLines = Math.ceil((field.sub.length || 0) / 40);
      bottomBoxH = (estimatedLines * (subSize + lineGap)) + (boxPadY * 2);
    }
    
    const totalFieldHeight = topBoxH + bottomBoxH;
    
    // Add consistent gap between fields
    currentY += totalFieldHeight + fieldGap;
  });
};

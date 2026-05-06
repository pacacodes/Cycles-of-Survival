/**
 * Draw event card field sections
 * Uses the same logic as organism cards for consistent appearance
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

  const textX = contentX + Math.round(21 * scale) + Math.round(20 * scale);
  const fieldGap = Math.round(5 * scale); // 5px gap between fields
  const color = card.neonColor;  // Event-type color
  const maxTextWidth = contentW - Math.round(21 * scale) - Math.round(20 * scale) - Math.round(8 * scale);

  const { drawTop, drawBottom } = getEventBackgroundFunctions();

  // Draw all fields with consistent spacing
  let currentY = contentY + Math.round(50 * scale);

  fields.forEach((field) => {
    const fieldResult = drawFieldRow(ctx, {
      textX,
      rowY: currentY,
      scale,
      color,
      titleColor: card.titleColor,
      maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined,
      hexToRgba,
      drawTop,
      drawBottom,
      ...field,
    });

    // Move to next field position: current field height + gap
    currentY += fieldResult.height + fieldGap;
  });
};

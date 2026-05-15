/**
 * Draw event card field sections
 * Uses modular field modules for each field type
 */

const drawEffectFieldRow = require('./fields/effect');
const drawBiomesFieldRow = require('./fields/biomes');
const drawOrganismsFieldRow = require('./fields/organisms');
const drawPeriodsFieldRow = require('./fields/periods');
const { hexToRgba, getCardColor } = require('../cards/layers/detailed-type/category/field-helpers');

module.exports = function drawEventFields(ctx, contentX, contentY, contentW, contentH, card, scale) {
  // Get fields from card
  const fields = card._eventFields || [];
  if (!fields.length) return;

  // Use positioning logic from organism cards but calculate total height first
  const badgeRadius   = 0.18 * 72 * scale;
  const badgeTextGap  = 10 * scale;
  const leftPadding   = Math.round(21 * scale);
  const bottomPadding = Math.round(6 * scale);

  const color = getCardColor(card);
  const textX = contentX + leftPadding + badgeRadius + badgeTextGap;
  // Max text width: from textX to the card's right content edge, minus a small right margin
  const maxTextWidth = contentW - leftPadding - badgeRadius - badgeTextGap - Math.round(8 * scale);

  // Map field types to their drawing functions
  const fieldDrawers = {
    effect: drawEffectFieldRow,
    biomes: drawBiomesFieldRow,
    organisms: drawOrganismsFieldRow,
    periods: drawPeriodsFieldRow,
  };

  // First pass: calculate total block height
  let totalHeight = 0;
  const fieldHeights = [];
  
  fields.forEach((field) => {
    const fieldType = field.label ? field.label.toLowerCase() : 'effect';
    const drawer = fieldDrawers[fieldType] || drawEffectFieldRow;
    
    const fieldResult = drawer(ctx, {
      textX,
      rowY: -999999, // Offscreen
      scale,
      color,
      titleColor: card.titleColor,
      main: field.main || '',
      sub: field.sub || null,
      maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined,
      hexToRgba,
    });
    
    fieldHeights.push(fieldResult.height);
    totalHeight += fieldResult.height;
  });

  // Calculate block Y position (at bottom of content area)
  const blockY = contentY + contentH - totalHeight - bottomPadding + Math.round(8 * scale);

  // Second pass: draw fields at correct positions
  let currentY = blockY;
  
  fields.forEach((field, i) => {
    const fieldType = field.label ? field.label.toLowerCase() : 'effect';
    const drawer = fieldDrawers[fieldType] || drawEffectFieldRow;
    
    drawer(ctx, {
      textX,
      rowY: currentY,
      scale,
      color,
      titleColor: card.titleColor,
      main: field.main || '',
      sub: field.sub || null,
      maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined,
      hexToRgba,
    });
    
    currentY += fieldHeights[i];
  });
};

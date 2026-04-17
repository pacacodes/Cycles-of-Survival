const getFieldDefinitions = require('./field-definitions');
const drawFieldRow        = require('./draw-field-row');
const { hexToRgba, getCardColor } = require('./field-helpers');

module.exports = function drawFunctionalCategory(ctx, contentX, contentY, contentW, contentH, card, scale) {
  const fields = getFieldDefinitions(card);
  if (!fields.length) return;

  const badgeRadius   = 0.18 * 72 * scale;
  const badgeTextGap  = 10 * scale;
  const leftPadding   = Math.round(21 * scale);
  const rowH          = Math.round((badgeRadius * 2) + (6 * scale));
  const condensedRowH = Math.round(rowH * 0.60);
  const blockHeight   = fields.length * condensedRowH;
  const bottomPadding = Math.round(6 * scale);
  const blockY        = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale);

  const color = getCardColor(card);
  const textX = contentX + leftPadding + badgeRadius + badgeTextGap;
  // Max text width: from textX to the card's right content edge, minus a small right margin
  const maxTextWidth = contentW - leftPadding - badgeRadius - badgeTextGap - Math.round(8 * scale);

  fields.forEach((field, i) => {
    drawFieldRow(ctx, {
      textX,
      rowY:       blockY + i * condensedRowH + 2,
      scale,
      color,
      titleColor: card.titleColor,
      maxWidth:   maxTextWidth > 0 ? maxTextWidth : undefined,
      hexToRgba,
      ...field,
    });
  });
};

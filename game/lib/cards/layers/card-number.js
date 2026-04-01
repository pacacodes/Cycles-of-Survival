module.exports = function drawCardNumber(ctx, safeX, safeY, card, scale) {
  const label = card.card_number || card.cardNumber || card.card_label || card.cardLabel || '';
  let numberText = '';

  if (typeof label === 'number') {
    numberText = String(label);
  } else if (typeof label === 'string') {
    const match = label.match(/\d+/);
    if (match) numberText = match[0];
  }

  if (!numberText) return;

  ctx.save();
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.font = `${Math.round(4 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';

  const padding = Math.round(0.09 * INCH * scale);
  const x = safeX + (CARD_TRIM_W * scale) - padding;
  const y = safeY + (CARD_TRIM_H * scale) - padding;

  ctx.fillText(numberText, x, y);
  ctx.restore();
};

const { CARD_TRIM_W, CARD_TRIM_H, INCH } = require('../../size');

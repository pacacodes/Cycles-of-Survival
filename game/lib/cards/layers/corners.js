const { CARD_TRIM_W, CARD_TRIM_H } = require('../../size');

module.exports = function drawCorners(ctx, safeX, safeY, card, scale) {
  const cornerPad = 6 * scale;
  ctx.save();
  ctx.font = `${Math.round(12 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const val = card.value || '';
  const suit = card.suit || '';
  const cornerText = `${val}${suit ? ' ' + suit : ''}`.trim();
  // Top-left
  ctx.fillText(cornerText, safeX + cornerPad, safeY + cornerPad);
  // Bottom-right rotated
  ctx.save();
  const brX = safeX + CARD_TRIM_W * scale - cornerPad;
  const brY = safeY + CARD_TRIM_H * scale - cornerPad;
  ctx.translate(brX, brY);
  ctx.rotate(Math.PI);
  ctx.textAlign = 'right';
  ctx.fillText(cornerText, -40 * scale, -14 * scale);
  ctx.restore();
  ctx.restore();
};

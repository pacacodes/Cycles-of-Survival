const { CARD_TRIM_W, CARD_TRIM_H } = require('../../size');

module.exports = function drawTrim(ctx, safeX, safeY, scale, { roundedRectPath }) {
  const corner = 10 * scale;
  ctx.save();
  ctx.lineWidth = 0.2 * scale; // much thinner
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'; // super light gray
  roundedRectPath(ctx, safeX, safeY, CARD_TRIM_W * scale, CARD_TRIM_H * scale, corner);
  ctx.stroke();
  ctx.restore();
};

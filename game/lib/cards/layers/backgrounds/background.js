const { CARD_BLEED_W, CARD_BLEED_H } = require('../../../size');
const { selectBackgroundDrawer } = require('./index');

module.exports = async function drawBackground(ctx, x, y, card, scale, { roundedRectPath }) {
  const corner = 10 * scale;
  const drawer = selectBackgroundDrawer(card);
  if (drawer) {
    // Await if drawer returns a Promise (is async)
    await drawer(ctx, x, y, { width: CARD_BLEED_W * scale, height: CARD_BLEED_H * scale, corner, scale, roundedRectPath, card });
    return;
  }
  // Fallback solid color
  ctx.save();
  ctx.fillStyle = card.background || '#FFFFFF';
  roundedRectPath(ctx, x, y, CARD_BLEED_W * scale, CARD_BLEED_H * scale, corner);
  ctx.fill();
  ctx.restore();
};

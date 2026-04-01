module.exports = function drawBody(ctx, contentX, contentY, contentW, card, scale, { wrapText }) {
  ctx.save();
  ctx.fillStyle = '#111111';
  ctx.font = `${Math.round(10 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  wrapText(ctx, card.text || '', contentX, contentY + 28 * scale, contentW, 14 * scale);
  ctx.restore();
};

module.exports = function drawOrder(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  const order = card.order || '';
  if (!order) {
    ctx.restore();
    return;
  }
  const fontSize = Math.round(7 * scale);
  ctx.font = `${fontSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let y = contentY + Math.round(65 * scale); // adjust as needed
  ctx.fillText(`Order: ${order}`, contentX + 20, y, contentW);
  ctx.restore();
};
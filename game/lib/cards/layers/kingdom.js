module.exports = function drawKingdom(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  const kingdom = card.kingdom || '';
  if (!kingdom) {
    ctx.restore();
    return;
  }
  const fontSize = Math.round(7 * scale);
  ctx.font = `${fontSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  // Position below functional category (estimate vertical offset)
  let y = contentY + Math.round(35 * scale); // adjust as needed
  ctx.fillText(`Kingdom: ${kingdom}`, contentX + 20, y, contentW);
  ctx.restore();
};
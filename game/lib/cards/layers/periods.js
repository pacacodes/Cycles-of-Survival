module.exports = function drawPeriods(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  const periods = card.periods || [];
  if (!periods.length) {
    ctx.restore();
    return;
  }
  const fontSize = Math.round(7 * scale);
  ctx.font = `${fontSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let y = contentY + Math.round(125 * scale); // adjust as needed
  ctx.fillText(`Periods: ${periods.join(', ')}`, contentX, y, contentW);
  ctx.restore();
};
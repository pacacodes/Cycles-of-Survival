module.exports = function drawFamily(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  const family = card.family || '';
  if (!family) {
    ctx.restore();
    return;
  }
  const fontSize = Math.round(7 * scale);
  ctx.font = `${fontSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let y = contentY + Math.round(75 * scale); // adjust as needed
  ctx.fillText(`Family: ${family}`, contentX + 20, y, contentW);
  ctx.restore();
};
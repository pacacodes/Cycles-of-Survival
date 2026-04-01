module.exports = function drawEras(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  const eras = card.eras || [];
  if (!eras.length) {
    ctx.restore();
    return;
  }
  const fontSize = Math.round(7 * scale);
  ctx.font = `${fontSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let y = contentY + Math.round(106 * scale); // reduced vertical offset
  ctx.fillText(`Eras: ${eras.join(', ')}`, contentX + 20, y, contentW);
  ctx.restore();
};
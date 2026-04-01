module.exports = function drawGenus(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  const genus = card.genus || '';
  if (!genus) {
    ctx.restore();
    return;
  }
  const fontSize = Math.round(7 * scale);
  ctx.font = `${fontSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let y = contentY + Math.round(80 * scale); // reduced vertical offset
  ctx.fillText(`Genus: ${genus}`, contentX + 20, y, contentW);
  ctx.restore();
};
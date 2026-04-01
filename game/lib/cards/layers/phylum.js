module.exports = function drawPhylum(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  const phylum = card.phylum || '';
  if (!phylum) {
    ctx.restore();
    return;
  }
  const fontSize = Math.round(7 * scale);
  ctx.font = `${fontSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let y = contentY + Math.round(45 * scale); // adjust as needed
  ctx.fillText(`Phylum: ${phylum}`, contentX + 20, y, contentW);
  ctx.restore();
};
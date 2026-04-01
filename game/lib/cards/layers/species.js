module.exports = function drawSpecies(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  const species = card.species || '';
  if (!species) {
    ctx.restore();
    return;
  }
  const fontSize = Math.round(7 * scale);
  ctx.font = `${fontSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let y = contentY + Math.round(90 * scale); // reduced vertical offset
  ctx.fillText(`Species: ${species}`, contentX + 20, y, contentW);
  ctx.restore();
};
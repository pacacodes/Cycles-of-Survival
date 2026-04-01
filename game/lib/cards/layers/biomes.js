module.exports = function drawBiomes(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  const biomes = card.biomes || [];
  if (!biomes.length) {
    ctx.restore();
    return;
  }
  const fontSize = Math.round(7 * scale);
  ctx.font = `${fontSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let y = contentY + Math.round(98 * scale); // reduced vertical offset
  const biomesText = `Biomes: ${biomes.join(', ')}`;
  if (card.card_number === 5 || card.id === 5 || card.title === '5') {
    console.log('[DEBUG] Card 5 biomes:', biomesText, 'contentW:', contentW);
  }
  ctx.fillText(biomesText, contentX + 20, y, contentW);
  ctx.restore();
};
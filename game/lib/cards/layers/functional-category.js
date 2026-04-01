module.exports = function drawFunctionalCategory(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  const functionalCategory = card.organism_type || '';
  if (!functionalCategory) {
    ctx.restore();
    return;
  }
  const categorySize = Math.round(6 * scale);
  const categoryFont = `${categorySize}px "DejaVu Sans", sans-serif`;
  ctx.font = categoryFont;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const categoryWidth = ctx.measureText(functionalCategory).width;
  const startX = contentX + (contentW - categoryWidth) / 2;
  // Position below scientific name (estimate vertical offset)
  let y = contentY + Math.round(9 * scale * 1.0); // common name height (reduced spacing)
  if (card.scientific_name) {
    y += Math.round(7 * scale * 0.9); // scientific name height (reduced spacing)
  }
  ctx.fillText(functionalCategory, startX, y);
  ctx.restore();
};
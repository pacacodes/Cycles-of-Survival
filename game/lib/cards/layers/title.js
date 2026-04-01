const drawTitleSymbols = require('./title-symbols');

module.exports = function drawTitle(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  ctx.fillStyle = card.titleColor || '#000000';
  const commonName = (card.common_name || '').toUpperCase();
  const scientificName = card.scientific_name || '';

  const commonSize = Math.round(8 * scale);
  const scientificSize = Math.round(6 * scale);

  const commonFont = `bold ${commonSize}px "DejaVu Sans", sans-serif`;
  const scientificFont = `italic ${scientificSize}px "DejaVu Sans", sans-serif`;

  ctx.textAlign = 'left'; // Still left for readability
  ctx.textBaseline = 'top';

  ctx.font = commonFont;
  const commonWidth = ctx.measureText(commonName).width;
  ctx.font = scientificFont;
  const scientificWidth = scientificName ? ctx.measureText(scientificName).width : 0;

  // Align title to the left with a 60px buffer from the card edge
  const leftBuffer = 60;
  let x = contentX + leftBuffer - 15;
  let y = contentY + Math.round(10 * scale) - 13;

  // Draw text
  ctx.font = commonFont;
  ctx.fillText(commonName, x, y);
  y += Math.round(commonSize * 1.2);

  if (scientificName) {
    ctx.font = scientificFont;
    ctx.fillText(scientificName, x, y);
    y += Math.round(scientificSize * 1.1);
    drawTitleSymbols(ctx, x, y, scale, card);
  }

  ctx.restore();
};

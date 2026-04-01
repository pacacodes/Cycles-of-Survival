module.exports = function drawTrophicLevel(ctx, contentX, contentY, contentW, card, scale) {
  ctx.save();
  let trophicLevel = card.trophic_level || '';
  // Remove anything in parentheses
  trophicLevel = trophicLevel.replace(/\s*\(.*?\)/, '');
  trophicLevel = trophicLevel.replace(/\b([a-z])/g, c => c.toUpperCase());
  if (!trophicLevel) {
    ctx.restore();
    return;
  }
  // Draw connector line and ring around badge
  const badgeRadius = 12 * scale;
  // Position badge (example: left of text)
  const badgeX = contentX + badgeRadius + 4 * scale;
  const badgeY = contentY + Math.round(135 * scale) + badgeRadius / 2;
  // Position field label (text)
  let y = contentY + Math.round(135 * scale);
  const fieldX = contentX + 60 * scale;
  const fieldY = badgeY;
  // Import connector function
  const drawTrophicLevelConnector = require('../connectors/trophic-level-connector');
  drawTrophicLevelConnector(ctx, badgeX, badgeY, fieldX, fieldY, badgeRadius, scale);
  // Draw badge (simple filled circle for now)
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeRadius * 0.7, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1 * scale;
  ctx.stroke();
  // Draw text label
  const fontSize = Math.round(7 * scale);
  ctx.font = `${fontSize}px "DejaVu Sans", sans-serif`;
  ctx.fillStyle = card.titleColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Trophic Level: ${trophicLevel}`, fieldX + 20, fieldY, contentW);
  ctx.restore();
};
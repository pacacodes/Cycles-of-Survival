const { loadImage } = require('canvas');
const path = require('path');

const badgeMap = {
  'cenozoic': require('./eras/cenozoic-badge'),
  'proterozoic': require('./eras/proterozoic-badge'),
  'precambrian': require('./eras/precambrian-badge'),
  'paleozoic': require('./eras/paleozoic-badge'),
  'paleogene': require('./eras/paleogene-badge'),
  'mesozoic': require('./eras/mesozoic-badge'),
};

module.exports = async function drawErasBadge(ctx, x, y, radius, card, scale, neonColor) {
  const era = (card && card.eras && card.eras[0])
    ? card.eras[0].toLowerCase().replace(/[^a-z0-9]+/g, '')
    : null;
  // Normalize badgeMap keys to match era label
  const badgeKey = Object.keys(badgeMap).find(
    k => era && era.includes(k)
  );
  if (badgeKey) {
    await badgeMap[badgeKey](ctx, x, y, radius, card, scale);
    return;
  }
  ctx.save();
  // Use neonColor for perimeter
  const color = neonColor || '#02BDF2';
  // Outer diffused neon glow
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.45;
  ctx.shadowColor = color;
  ctx.shadowBlur = 24 * scale;
  ctx.lineWidth = 3.2 * scale;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
  // Crisp neon color
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.1 * scale;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
  // Center white highlight (diffused, less dominant)
  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.shadowBlur = 2 * scale;
  ctx.lineWidth = 0.5 * scale;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
  // Removed subtle dark fill to eliminate unwanted circle
};
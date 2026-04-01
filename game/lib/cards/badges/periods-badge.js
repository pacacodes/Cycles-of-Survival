const { loadImage } = require('canvas');
const path = require('path');

const badgeMap = {
  'triassic': require('./periods/triassic-badge'),
  'paleogene': require('./periods/paleogene-badge'),
  'cretaceous': require('./periods/cretaceous-badge'),
  'silurian': require('./periods/silurian-cambrian-badge'),
  'cambrian': require('./periods/cambrian-badge'),
  'carboniferous': require('./periods/carboniferous-badge'),
  'devonian': require('./periods/devonian-badge'),
  'jurassic': require('./periods/jurassic-badge'),
  'ordovician': require('./periods/ordovician-badge'),
  'permian': require('./periods/permian-badge'),
  'neogene': require('./periods/neogene-badge'),
  'quaternary': require('./periods/quaternary-badge'),
  'proterozoic': require('./periods/proterozoic-badge'),
  'archean': require('./periods/archean-badge'),
};

module.exports = async function drawPeriodsBadge(ctx, x, y, radius, card, scale, neonColor) {
  const period = (card && card.periods && card.periods[0])
    ? card.periods[0].toLowerCase().replace(/[^a-z0-9]+/g, '')
    : null;
  // Normalize badgeMap keys to match period label
  const badgeKey = Object.keys(badgeMap).find(
    k => period && period.includes(k)
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
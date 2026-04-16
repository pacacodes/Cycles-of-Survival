// Canonical roles an organism can be classified under.
const badgeMap = {
  producer:           require('./role/producer-badge'),
  herbivore:          require('./role/herbivore-badge'),
  predator:           require('./role/predator-badge'),
  apexpredator:       require('./role/apex-predator-badge'),
  scavenger:          require('./role/scavenger-badge'),
  filterfeeder:       require('./role/filter-feeder-badge'),
  decomposer:         require('./role/decomposer-badge'),
  detritivore:        require('./role/detritivore-badge'),
  ecosystemengineer:  require('./role/ecosystem-engineer-badge'),
  builder:            require('./role/builder-badge'),
  mutualist:          require('./role/mutualist-badge'),
  parasite:           require('./role/scavenger-badge'),  // placeholder – no PNG yet
  plagueswarm:        require('./role/plague-swarm-badge'),
};

module.exports = async function drawRoleBadge(ctx, x, y, radius, card, scale, neonColor) {
  const normalize = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

  // Use the first role value from card.role array, or card.role as string
  const roleRaw = Array.isArray(card.role) ? card.role[0] : (card.role || '');
  const label = normalize(roleRaw);

  let badgeKey = Object.prototype.hasOwnProperty.call(badgeMap, label) ? label : undefined;
  if (!badgeKey) {
    badgeKey = Object.keys(badgeMap)
      .sort((a, b) => b.length - a.length)
      .find(k => label.includes(k));
  }

  if (badgeKey) {
    const drawBadge = badgeMap[badgeKey];
    const result = drawBadge(ctx, x, y, radius, card, scale, neonColor);
    if (result && typeof result.then === 'function') return await result;
    return;
  }

  // Fallback: neon circle
  const color = neonColor || '#02BDF2';
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

  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.1 * scale;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.shadowBlur = 2 * scale;
  ctx.lineWidth = 0.5 * scale;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
};

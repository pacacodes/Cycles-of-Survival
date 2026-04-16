const badgeMap = {
  apexpredator:       require('./role/apex-predator-badge'),
  predator:           require('./role/apex-predator-badge'),
  filterfeeder:       require('./role/filter-feeder-badge'),
  scavenger:          require('./role/scavenger-badge'),
  builder:            require('./role/builder-badge'),
  ecosystemengineer:  require('./role/ecosystem-engineer-badge'),
  mutualist:          require('./role/mutualist-badge'),
  plagueswarm:        require('./role/plague-swarm-badge'),
  detritivore:        require('./role/detritivore-badge'),
  // Roles that share closest visual match
  benthicfeeder:      require('./role/filter-feeder-badge'),
  durophagousgrazer:  require('./role/scavenger-badge'),
  durophagousfeeder:  require('./role/scavenger-badge'),
  grazer:             require('./role/filter-feeder-badge'),
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

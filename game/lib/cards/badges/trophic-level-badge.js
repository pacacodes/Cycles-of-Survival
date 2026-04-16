const badgeMap = {
  // New standard 5-level values (full normalized forms first for priority)
  primaryproducersautotrophs:                          require('./trophic level/producer-badge'),
  primaryconsumersherbivores:                          require('./trophic level/primary-consumer-badge'),
  secondaryconsumerscarnivoresthateatherbivores:        require('./trophic level/secondary-consumer-badge'),
  tertiaryconsumerscarnivoresthateatothercarnivores:    require('./trophic level/apex-predator-badge'),
  decomposersdetritivoresorganismsthatbreakdowndeadmaterial: require('./trophic level/decomposer-badge'),
  // Legacy short-form values (kept for backward compatibility)
  builder: require('./trophic level/builder-badge'),
  producer: require('./trophic level/producer-badge'),
  secondaryconsumer: require('./trophic level/secondary-consumer-badge'),
  primaryconsumer: require('./trophic level/primary-consumer-badge'),
  consumer: require('./trophic level/consumer-badge'),
  detritivore: require('./trophic level/detritivore-badge'),
  decomposer: require('./trophic level/decomposer-badge'),
  filterfeeder: require('./trophic level/filter-feeder-badge'),
  scavenger: require('./trophic level/scavenger-badge'),
  mutualist: require('./trophic level/mutualist-badge'),
  ecosystemengineer: require('./trophic level/ecosystem-engineer-badge'),
  nutrientcyclesdetoxifier: require('./trophic level/nutrient-cycler-detoxifier-badge'),
  nutrientcyclerdetoxifier: require('./trophic level/nutrient-cycler-detoxifier-badge'),
  plagueswarmorganism: require('./trophic level/plague-swarm-organism-badge'),
  apexpredator: require('./trophic level/apex-predator-badge'),
};

module.exports = async function drawTrophicLevelBadge(ctx, x, y, radius, card, scale, neonColor) {
  console.log('[TrophicLevelBadge] label:', card && card.trophic_level);

  const normalize = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const label = normalize(card && card.trophic_level);

  // Secondary consumer: exact label only (never via fallback matching)
  if (label === 'secondaryconsumer' || label === 'secondaryconsumerscarnivoresthateatherbivores') {
    const drawBadge = badgeMap.secondaryconsumer;
    const result = drawBadge(ctx, x, y, radius, card, scale, neonColor);
    if (result && typeof result.then === 'function') return await result;
    return;
  }

  // Normal matching for everything else
  let badgeKey = Object.prototype.hasOwnProperty.call(badgeMap, label) ? label : undefined;
  if (!badgeKey) {
    badgeKey = Object.keys(badgeMap)
      .filter(k => k !== 'secondaryconsumer' && k !== 'secondaryconsumerscarnivoresthateatherbivores') // prevent accidental fallback to secondary badge
      .sort((a, b) => b.length - a.length)
      .find(k => label.includes(k));
  }

  console.log('[TrophicLevelBadge] normalized label:', label, 'badgeKey:', badgeKey);

  if (badgeKey) {
    console.log('[TrophicLevelBadge] badgeMap hit:', badgeKey);
    const drawBadge = badgeMap[badgeKey];
    const result = drawBadge(ctx, x, y, radius, card, scale, neonColor);
    if (result && typeof result.then === 'function') return await result;
    return;
  }

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

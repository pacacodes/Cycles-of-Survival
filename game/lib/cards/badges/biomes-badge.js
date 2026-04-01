  const grasslandBiome = require('../layers/biomes/grassland_biome');
const { loadImage } = require('canvas');


const badgeMap = {
  'desert': require('./biomes/desert-badge'),
  'farmland': require('./biomes/farmland-badge'),
  'floodplain': require('./biomes/floodplain-badge'),
  'reef': require('./biomes/reef-badge'),
  'forest': require('./biomes/forest-badge'),
  'freshwater': require('./biomes/freshwater-badge'),
  'marine': require('./biomes/marine-badge'),
  'grassland': require('./biomes/grassland-badge'),
  'taiga': require('./biomes/taiga-badge'),
  'tundra': require('./biomes/tundra-badge'),
  'urban': require('./biomes/urban-badge'),
  'wetland': require('./biomes/wetland-badge'),
};

async function drawBiomesBadge(ctx, x, y, radius, card, scale, neonColor) {
  if (!card || !card.biomes || !Array.isArray(card.biomes)) return;
  // Deduplicate and map biomes to badge keys
  const seen = new Set();
  for (const biomeRaw of card.biomes) {
    const biome = biomeRaw.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const badgeKey = Object.keys(badgeMap).find(
      k => biome && biome.includes(k)
    );
    if (badgeKey && !seen.has(badgeKey)) {
      await badgeMap[badgeKey](ctx, { x, y, radius, card, scale, neonColor });
      seen.add(badgeKey);
    }
  }
}
module.exports = drawBiomesBadge;
module.exports.badgeMap = badgeMap;
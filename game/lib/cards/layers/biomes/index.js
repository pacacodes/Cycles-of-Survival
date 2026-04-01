function normBiome(card) {
  return (card.biome || '').toLowerCase();
}


const forest = require('./forest_biome');
const desert = require('./desert_biome');

const farmland = require('./farmland_biome');
const floodplain = require('./floodplain_biome');
const reef = require('./reef_biome');
const freshwater = require('./freshwater_biome');
const marine = require('./marine_biome');

const registry = {
  forest,
  desert,
  farmland,
  floodplain,
  reef,
  freshwater,
  marine,
};

function selectBiomeDrawer(card) {
  const key = normBiome(card);
  return registry[key];
}

module.exports = {
  selectBiomeDrawer,
};

function normType(card) {
  const t = (card.type || card.category || '').toLowerCase();
  if (t) return t;
  // Optional heuristic: map suits to types if type unspecified
  switch (card.suit) {
    case '♠': return 'crisis';
    case '♣': return 'soil';
    case '♦': return 'earth-event';
    case '♥': return 'organism';
    default: return '';
  }
}

function hasEmbeddedBackgroundPhoto(card) {
  const label = (card && card.card_label) || '';
  const common = ((card && card.common_name) || '').toLowerCase();
  const scientific = ((card && card.scientific_name) || '').toLowerCase();

  return (
    common === 'sulfur-reducing bacterium' ||
    common === 'great white shark' ||
    common === 'piñon pine' ||
    common === 'tube sponge' ||
    common === 'early reptile' ||
    common === 'morganucodon' ||
    common.includes('termite') ||
    scientific === 'desulfovibrio vulgaris' ||
    scientific === 'carcharodon carcharias' ||
    scientific === 'pinus edulis' ||
    scientific === 'aplysina fistularis' ||
    scientific === 'hylonomus lyelli' ||
    scientific === 'morganucodon watsoni' ||
    scientific === 'macrotermes bellicosus'
  );
}

const soil = require('./soil_background');
const organism = require('./organism_background');
const biome = require('./biome_background');
const earthEvent = require('./earth_event_background');
const crisis = require('./crisis_background');


const registry = {
  soil,
  organism,
  biome,
  'earth-event': earthEvent,
  crisis,
};


function selectBackgroundDrawer(card) {
            // Special case: Macrotermes bellicosus
            if (
              (card.common_name && card.common_name.toLowerCase().includes('termite')) ||
              (card.scientific_name && card.scientific_name.toLowerCase() === 'macrotermes bellicosus')
            ) {
              return require('./Macrotermes_bellicosus_background');
            }
          // Special case: Pinus edulis
          if (
            (card.common_name && card.common_name.toLowerCase() === 'piñon pine') ||
            (card.scientific_name && card.scientific_name.toLowerCase() === 'pinus edulis')
          ) {
            return require('./Pinus_edulis_background');
          }
        // Special case: Morganucodon watsoni
        if (
          (card.common_name && card.common_name.toLowerCase() === 'morganucodon') ||
          (card.scientific_name && card.scientific_name.toLowerCase() === 'morganucodon watsoni')
        ) {
          return require('./Morganucodon_watsoni_background');
        }
      // Special case: Hylonomus lyelli
      if (
        (card.common_name && card.common_name.toLowerCase() === 'early reptile') ||
        (card.scientific_name && card.scientific_name.toLowerCase() === 'hylonomus lyelli')
      ) {
        return require('./Hylonomus_lyelli_background');
      }
    // Special case: Aplysina fistularis
    if (
      (card.common_name && card.common_name.toLowerCase() === 'tube sponge') ||
      (card.scientific_name && card.scientific_name.toLowerCase() === 'aplysina fistularis')
    ) {
      return require('./Aplysina_fistularis_background');
    }
  // Special case: Desulfovibrio vulgaris
  if (
    (card.common_name && card.common_name.toLowerCase() === 'sulfur-reducing bacterium') ||
    (card.scientific_name && card.scientific_name.toLowerCase() === 'desulfovibrio vulgaris')
  ) {
    return require('./Desulfovibrio_vulgaris_background');
  }
  // Special case: Carcharodon carcharias
  if (
    (card.common_name && card.common_name.toLowerCase() === 'great white shark') ||
    (card.scientific_name && card.scientific_name.toLowerCase() === 'carcharodon carcharias')
  ) {
    return require('./Carcharodon_carcharias_background');
  }
  const key = normType(card);
  return registry[key];
}

module.exports = {
  selectBackgroundDrawer,
  hasEmbeddedBackgroundPhoto,
};

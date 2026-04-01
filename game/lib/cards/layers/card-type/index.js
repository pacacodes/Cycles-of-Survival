function normType(card) {
  const t = (card.type || card.category || '').toLowerCase();
  if (t) return t;
  switch (card.suit) {
    case '♠': return 'crisis';
    case '♣': return 'soil';
    case '♦': return 'earth-event';
    case '♥': return 'organism';
    default: return '';
  }
}

const soil = require('./soil_type');
const organism = require('./organism_type');
const biome = require('./biome_type');
const earthEvent = require('./earth_event_type');
const crisis = require('./crisis_type');

const registry = {
  soil,
  organism,
  biome,
  'earth-event': earthEvent,
  crisis,
};

function selectCardTypeDrawer(card) {
  const key = normType(card);
  return registry[key];
}

module.exports = {
  selectCardTypeDrawer,
};

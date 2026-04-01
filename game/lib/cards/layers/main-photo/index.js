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

const soil = require('./soil_photo');
const organism = require('./organism_photo');
const anabaena = require('./anabaena_photo');
const biome = require('./biome_photo');
const earthEvent = require('./earth_event_photo');
const crisis = require('./crisis_photo');


const registry = {
  soil,
  organism,
  biome,
  'earth-event': earthEvent,
  crisis,
};


function selectMainPhotoDrawer(card) {
  // Special case: Card 1 (Anabaena sp.)
  if (
    card &&
    ((card.card_label && card.card_label.trim() === 'Card 1') ||
      (card.scientific_name && card.scientific_name.trim().toLowerCase() === 'anabaena sp.'))
  ) {
    return anabaena;
  }
  const key = normType(card);
  if (registry[key]) return registry[key];

  // Working organism cards may not provide `type`/`category`/`suit`.
  // If the card looks like an organism record, use the organism drawer.
  if (card && (card.scientific_name || card.main_photo || card.organism_type)) {
    return organism;
  }

  return undefined;
}

module.exports = {
  selectMainPhotoDrawer,
};

function normType(card) {
  const t = (card.type || card.category || '').toLowerCase();
  return t || '';
}

const soil = require('./soil_detailed');
const organism = require('./organism_detailed');
const crisis = require('./crisis_detailed');

const registry = {
  soil,
  organism,
  crisis,
};

function selectDetailedTypeDrawer(card) {
  const key = normType(card);
  return registry[key];
}

module.exports = {
  selectDetailedTypeDrawer,
};

function normFilter(card) {
  return (card.filter || '').toLowerCase();
}

const dna = require('./dna_overlay');
const roots = require('./root_overlay');

const registry = {
  dna,
  roots,
};

function selectFilterDrawer(card) {
  const key = normFilter(card);
  return registry[key];
}

module.exports = {
  selectFilterDrawer,
};

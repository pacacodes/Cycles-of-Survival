function normTrophic(card) {
  return (card.trophic || '').toLowerCase();
}

const producer = require('./producer');
const consumer = require('./consumer');
const decomposer = require('./decomposer');
const apex = require('./apex');

const registry = {
  producer,
  consumer,
  decomposer,
  apex,
};

function selectTrophicDrawer(card) {
  const key = normTrophic(card);
  return registry[key];
}

module.exports = {
  selectTrophicDrawer,
};

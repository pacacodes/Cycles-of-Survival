function normEra(card) {
  return (card.era || '').toLowerCase();
}

const cenozoic = require('./cenozoic');
const mesozoic = require('./mesozoic');
const paleozoic = require('./paleozoic');
const precambrian = require('./precambrian');

const registry = {
  cenozoic,
  mesozoic,
  paleozoic,
  precambrian,
};

function selectEraDrawer(card) {
  const key = normEra(card);
  return registry[key];
}

module.exports = {
  selectEraDrawer,
};

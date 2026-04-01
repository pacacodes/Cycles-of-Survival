function normSoil(card) {
  return (card.soilType || '').toLowerCase();
}

const sandy = require('./sandy');
const clay = require('./clay');
const silt = require('./silt');
const loam = require('./loam');

const registry = {
  sandy,
  clay,
  silt,
  loam,
};

function selectSoilDrawer(card) {
  const key = normSoil(card);
  return registry[key];
}

module.exports = {
  selectSoilDrawer,
};

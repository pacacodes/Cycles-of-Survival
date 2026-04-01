function hasRequirements(card) {
  return Array.isArray(card.requirements) && card.requirements.length > 0;
}

const list = require('./list_requirements');

function selectRequirementsDrawer(card) {
  if (hasRequirements(card)) return list;
  return undefined;
}

module.exports = {
  selectRequirementsDrawer,
};

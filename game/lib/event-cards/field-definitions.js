/**
 * Field definitions for event cards
 * Specifies how to display biomes and organisms with +/- indicators
 */

/**
 * Format biomes list with +/- indicators
 * @param {Array} biomesBad - List of biomes negatively affected
 * @param {Array} biomesGood - List of biomes positively affected
 * @returns {Array} Formatted biome entries with indicators
 */
function formatBiomes(biomesBad = [], biomesGood = []) {
  const biomes = [];
  
  if (Array.isArray(biomesBad)) {
    biomesBad.forEach(biome => {
      biomes.push({ name: biome, indicator: '−' });
    });
  }
  
  if (Array.isArray(biomesGood)) {
    biomesGood.forEach(biome => {
      biomes.push({ name: biome, indicator: '+' });
    });
  }
  
  return biomes;
}

/**
 * Format organisms list with +/- indicators
 * @param {Array} organismsBad - List of organisms negatively affected (object format)
 * @param {Array} organismsGood - List of organisms positively affected (object format)
 * @returns {Array} Formatted organism entries with indicators
 */
function formatOrganisms(organismsBad = [], organismsGood = []) {
  const organisms = [];
  
  if (Array.isArray(organismsBad)) {
    organismsBad.forEach(org => {
      organisms.push({
        group: org.group || '',
        example: org.example || '',
        indicator: '−',
      });
    });
  }
  
  if (Array.isArray(organismsGood)) {
    organismsGood.forEach(org => {
      organisms.push({
        group: org.group || '',
        example: org.example || '',
        indicator: '+',
      });
    });
  }
  
  return organisms;
}

/**
 * Get field groups for card display
 * Defines which fields appear on the card and in what order
 * @returns {Array} Array of field group definitions
 */
function getEventCardFields() {
  return [
    {
      name: 'effect',
      label: 'Effect',
      type: 'text',
    },
    {
      name: 'biomes',
      label: 'Biomes Affected',
      type: 'list',
    },
    {
      name: 'organisms',
      label: 'Organisms Affected',
      type: 'list',
    },
    {
      name: 'stats',
      label: 'Global Impact',
      type: 'stats',
      fields: ['biodiversityChange', 'o2Change', 'co2Change', 'h2o'],
    },
  ];
}

/**
 * Prepare event data for card rendering
 * @param {Object} event - Raw event object from config
 * @returns {Object} Formatted event with display-ready data
 */
function prepareEventForDisplay(event) {
  return {
    id: event.name.replace(/\s+/g, '-').toLowerCase(),
    name: event.name,
    title: event.name,
    number: event.number || null,
    background: event.background || 'event-card',
    type: event.type,
    trend: event.trend || '',
    period: event.period || '',
    approxMa: event.approxMa || null,
    scope: event.scope || '',
    effectText: event.effectText || '',
    co2Change: event.co2Change || 0,
    o2Change: event.o2Change || 0,
    biodiversityChange: event.biodiversityChange || 0,
    h2o: event.h2o || 0,
    biomes: formatBiomes(event.biomesBad, event.biomesGood),
    organisms: formatOrganisms(event.organismsBad, event.organismsGood),
  };
}

module.exports = {
  formatBiomes,
  formatOrganisms,
  getEventCardFields,
  prepareEventForDisplay,
};

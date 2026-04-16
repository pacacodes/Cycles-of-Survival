const { parseField, formatValue } = require('./field-helpers');

const ORGANISM_TYPE_DESC = {
  'Microbes':                   'bacteria, archaea & protists',
  'Algae and phytoplankton':    'photosynthetic aquatic organisms',
  'Aquatic plants':             'water-rooted vascular plants',
  'Aquatic invertebrates':      'corals, molluscs & crustaceans',
  'Aquatic vertebrates':        'fish, marine mammals & sea turtles',
  'Plants':                     'land-based photosynthesizers',
  'Terrestrial invertebrates':  'insects, arachnids & worms',
  'Terrestrial vertebrates':    'mammals, reptiles, amphibians & birds',
  'Fungi':                      'decomposers & symbiotic organisms',
};

const ROLE_DESC = {
  'producer':           'creates organic matter from sunlight',
  'herbivore':          'eats plants & algae',
  'predator':           'hunts & eats other animals',
  'apex_predator':      'top of the food chain',
  'scavenger':          'eats dead or decaying matter',
  'filter_feeder':      'filters food particles from water',
  'decomposer':         'breaks down dead organic matter',
  'detritivore':        'consumes decomposing material',
  'ecosystem_engineer': 'shapes habitat for other species',
  'builder':            'constructs physical structures',
  'mutualist':          'benefits another species mutually',
  'parasite':           'feeds on a living host organism',
  'plague_swarm':       'mass-impact outbreak organism',
};

/**
 * Returns an ordered array of field row configs for a card.
 * Each entry: { label, main, sub, drawTop, drawBottom }
 */
module.exports = function getFieldDefinitions(card) {
  const fields = [];

  if (card.organism_type) {
    const parsed = parseField(card.organism_type);
    fields.push({
      label: 'Organism Type',
      main:  parsed.main,
      sub:   parsed.sub || ORGANISM_TYPE_DESC[card.organism_type] || null,
      drawTop:    require('./functional-category-background-top'),
      drawBottom: require('./functional-category-background-bottom'),
    });
  }

  if (card.biomes && card.biomes.length) {
    fields.push({
      label: 'Biomes',
      main:  card.biomes.map(b => formatValue(b)).join(', '),
      sub:   null,
      drawTop:    require('./biomes-background-top'),
      drawBottom: require('./biomes-background-bottom'),
    });
  }

  if (card.trophic_level) {
    const parsed = parseField(card.trophic_level);
    fields.push({
      label: 'Trophic Level',
      main:  parsed.main,
      sub:   parsed.sub || null,
      drawTop:    require('./trophic-level-background-top'),
      drawBottom: require('./trophic-level-background-bottom'),
    });
  }

  if (card.role && (Array.isArray(card.role) ? card.role.length : card.role)) {
    const roleRaw = Array.isArray(card.role) ? card.role[0] : card.role;
    const parsed  = parseField(roleRaw);
    fields.push({
      label: 'Role',
      main:  parsed.main,
      sub:   parsed.sub || ROLE_DESC[roleRaw] || null,
      drawTop:    require('./role-background-top'),
      drawBottom: require('./role-background-bottom'),
    });
  }

  if (card.periods && card.periods.length) {
    fields.push({
      label: 'Periods',
      main:  card.periods.map(p => formatValue(p)).join(', '),
      sub:   null,
      drawTop:    require('./periods-background-top'),
      drawBottom: require('./periods-background-bottom'),
    });
  }

  return fields;
};


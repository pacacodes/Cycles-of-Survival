const { parseField, formatValue } = require('./field-helpers');

// Geological period time ranges (start Ma = million years ago, end Ma; Ga = billion)
// Format: [startMa, endMa, label] — end=0 means "Present"
const PERIOD_RANGES = {
  'Early Archean':     [4000,  3200, '~4.0 – 3.2 Ga'],
  'Late Archean':      [3200,  2500, '~3.2 – 2.5 Ga'],
  'Early Proterozoic': [2500,  1600, '~2.5 – 1.6 Ga'],
  'Late Proterozoic':  [1000,   539, '~1.0 Ga – 539 Ma'],
  'Cambrian':          [ 539,   485, '539 – 485 Ma'],
  'Ordovician':        [ 485,   444, '485 – 444 Ma'],
  'Silurian':          [ 444,   419, '444 – 419 Ma'],
  'Devonian':          [ 419,   359, '419 – 359 Ma'],
  'Carboniferous':     [ 359,   299, '359 – 299 Ma'],
  'Permian':           [ 299,   252, '299 – 252 Ma'],
  'Triassic':          [ 252,   201, '252 – 201 Ma'],
  'Jurassic':          [ 201,   145, '201 – 145 Ma'],
  'Cretaceous':        [ 145,    66, '145 – 66 Ma'],
  'Paleogene':         [  66,    23, '66 – 23 Ma'],
  'Neogene':           [  23,   2.6, '23 – 2.6 Ma'],
  'Quaternary':        [ 2.6,     0, '2.6 Ma – Present'],
};

function periodTimeSpan(periods) {
  const matched = periods.map(p => PERIOD_RANGES[p]).filter(Boolean);
  if (!matched.length) return null;
  if (matched.length === 1) return matched[0][2];
  // Multiple periods: show span from oldest start to newest end
  const oldest  = Math.max(...matched.map(r => r[0]));
  const newest  = Math.min(...matched.map(r => r[1]));
  const oldestEntry = matched.find(r => r[0] === oldest);
  const newestEntry = matched.find(r => r[1] === newest);
  const startLabel = oldestEntry[2].split('–')[0].trim();
  const endLabel   = newestEntry[2].split('–')[1].trim();
  return `${startLabel} – ${endLabel}`;
}

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

const BIOME_DESC = {
  'Desert':     'arid, low-rainfall landscapes',
  'Farmland':   'agricultural & cultivated land',
  'Floodplain': 'low land subject to river flooding',
  'Forest':     'dense tree-dominated ecosystems',
  'Freshwater': 'rivers, lakes & ponds',
  'Grassland':  'open grassy plains & savannas',
  'Marine':     'open ocean & coastal seas',
  'Reef':       'coral & rocky reef ecosystems',
  'Taiga':      'boreal coniferous forest belt',
  'Tundra':     'cold, treeless Arctic & alpine zones',
  'Urban':      'cities & human-built environments',
  'Wetland':    'marshes, swamps & bogs',
};

// Derive a specific organism description from its taxonomy fields.
// Falls back through kingdom → class → phylum for maximum specificity.
function getSpecificTypeDesc(card) {
  const kingdom = (card.kingdom || '').trim();
  const phylum  = (card.phylum  || '').trim();
  const cls     = (card.class   || '').trim();

  // Kingdom-level specifics (microbes)
  if (kingdom === 'Bacteria') return 'bacterium';
  if (kingdom === 'Archaea')  return 'archaeon';
  if (kingdom === 'Protista') return 'protist';

  // Algae classes
  if (cls === 'Bacillariophyceae') return 'diatom';
  if (cls === 'Dinophyceae')       return 'dinoflagellate';
  if (cls === 'Florideophyceae')   return 'red alga';
  if (cls === 'Prymnesiophyceae')  return 'haptophyte';
  if (cls === 'Phaeophyceae')      return 'brown alga';
  if (cls === 'Zygnematophyceae')  return 'green alga';

  // Fungi / lichen
  if (kingdom === 'Fungi' && cls === 'Lecanoromycetes') return 'lichen';
  if (kingdom === 'Fungi') return 'fungus';

  // Plants by phylum / class
  if (phylum === 'Bryophyta')      return 'moss';
  if (phylum === 'Lycopodiophyta') return 'lycopsid';
  if (phylum === 'Pinophyta')      return 'conifer';
  if (cls    === 'Polypodiopsida') return 'fern';
  if (cls    === 'Rhyniopsida')    return 'early vascular plant';
  if (phylum === 'Tracheophyta')   return 'vascular plant';
  if (cls    === 'Liliopsida')     return 'monocot';
  if (phylum === 'Magnoliophyta')  return 'flowering plant';

  // Invertebrates by class
  if (cls === 'Trilobita')      return 'trilobite';
  if (cls === 'Anthozoa')       return 'coral';
  if (cls === 'Demospongiae')   return 'sponge';
  if (cls === 'Malacostraca')   return 'crustacean';
  if (cls === 'Gastropoda')     return 'gastropod';
  if (cls === 'Bivalvia')       return 'bivalve';
  if (cls === 'Cephalopoda')    return 'cephalopod';
  if (cls === 'Crinoidea')      return 'crinoid';
  if (cls === 'Dinocarida')     return 'anomalocarid';
  if (cls === 'Merostomata')    return 'sea scorpion';
  if (cls === 'Rhynchonellata') return 'brachiopod';
  if (phylum === 'Porifera')    return 'sponge';
  if (phylum === 'Brachiopoda') return 'brachiopod';
  if (phylum === 'Annelida')    return 'annelid worm';
  if (phylum === 'Echinodermata') return 'echinoderm';

  // Vertebrates by class
  if (cls === 'Petromyzontida') return 'jawless fish';
  if (cls === 'Placodermi')     return 'placoderm';
  if (cls === 'Chondrichthyes') return 'cartilaginous fish';
  if (cls === 'Actinopterygii') return 'ray-finned fish';
  if (cls === 'Sarcopterygii')  return 'lobe-finned fish';
  if (cls === 'Amphibia')       return 'amphibian';
  if (cls === 'Synapsida')      return 'synapsid';
  if (cls === 'Aves')           return 'bird';
  if (cls === 'Reptilia' && card.organism_type === 'Aquatic vertebrates') return 'aquatic reptile';
  if (cls === 'Reptilia')       return 'reptile';
  if (cls === 'Mammalia' && card.organism_type === 'Aquatic vertebrates') return 'marine mammal';
  if (cls === 'Mammalia')       return 'mammal';

  // Arthropods
  if (cls === 'Insecta')   return 'insect';
  if (cls === 'Arachnida') return 'arachnid';
  if (cls === 'Clitellata') return 'segmented worm';

  // Fall back to generic category description
  return ORGANISM_TYPE_DESC[card.organism_type] || null;
}

/**
 * Returns an ordered array of field row configs for a card.
 * Each entry: { label, main, sub, drawTop, drawBottom }
 */
module.exports = function getFieldDefinitions(card) {
  const fields = [];

  if (card.organism_type) {
    const parsed = parseField(card.organism_type);
    fields.push({
      label: 'Type',
      main:  parsed.main,
      sub:   parsed.sub || getSpecificTypeDesc(card),
      drawTop:    require('./functional-category-background-top'),
      drawBottom: require('./functional-category-background-bottom'),
    });
  }

  if (card.biomes && card.biomes.length) {
    const biomeNames = card.biomes.map(b => formatValue(b));
    const biomeDescs = card.biomes.map(b => BIOME_DESC[b]).filter(Boolean);
    fields.push({
      label: 'Biomes',
      main:  biomeNames.join(', '),
      sub:   biomeDescs.length ? biomeDescs.join(' · ') : null,
      drawTop:    require('./biomes-background-top'),
      drawBottom: require('./biomes-background-bottom'),
    });
  }

  if (card.trophic_level) {
    const isCombined = /decompos|detrit/i.test(card.trophic_level);
    if (isCombined) {
      // Split into specific entry based on primary role
      const roles = Array.isArray(card.role) ? card.role : (card.role ? [card.role] : []);
      const isDetritivore = roles.some(r => /detrit/i.test(r));
      fields.push({
        label: 'Trophic Level',
        main:  isDetritivore ? 'Detritivores' : 'Decomposers',
        sub:   isDetritivore ? 'consumes decomposing material' : 'breaks down dead organic matter',
        drawTop:    require('./trophic-level-background-top'),
        drawBottom: require('./trophic-level-background-bottom'),
      });
    } else {
      const parsed = parseField(card.trophic_level);
      fields.push({
        label: 'Trophic Level',
        main:  parsed.main,
        sub:   parsed.sub || null,
        drawTop:    require('./trophic-level-background-top'),
        drawBottom: require('./trophic-level-background-bottom'),
      });
    }
  }

  if (card.role && (Array.isArray(card.role) ? card.role.length : card.role)) {
    const roleArr = Array.isArray(card.role) ? card.role : [card.role];
    const roleRaw = roleArr[0];
    const parsed  = parseField(roleRaw);
    const roleDescs = roleArr.map(r => ROLE_DESC[r]).filter(Boolean);
    fields.push({
      label: 'Role',
      main:  parsed.main,
      sub:   parsed.sub || (roleDescs.length ? roleDescs.join(' · ') : null),
      drawTop:    require('./role-background-top'),
      drawBottom: require('./role-background-bottom'),
    });
  }

  if (card.periods && card.periods.length) {
    fields.push({
      label: 'Periods',
      main:  card.periods.map(p => formatValue(p)).join(', '),
      sub:   periodTimeSpan(card.periods),
      drawTop:    require('./periods-background-top'),
      drawBottom: require('./periods-background-bottom'),
    });
  }

  return fields;
};


const { parseField, formatValue } = require('./field-helpers');

// Geological period time ranges (start Ma = million years ago, end Ma; Ga = billion)
// Format: [startMa, endMa, label] — end=0 means "Present"
const PERIOD_RANGES = {
  'Early Archean':     [4000,  3200, '~4.0 – 3.2 Ga'],
  'Late Archean':      [3200,  2500, '~3.2 – 2.5 Ga'],
  'Early Proterozoic': [2500,  1600, '~2.5 – 1.6 Ga'],
  'Late Proterozoic':  [1000,   635, '~1.0 Ga – 635 Ma'],
  'Ediacaran':         [ 635,   539, '635 – 539 Ma'],
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

// Short clarifier appended after the one-word parenthetical from the raw trophic_level field
const TROPHIC_SUB_EXTRA = {
  'autotrophs':  '· forms food from light & CO₂',
  'herbivores':  '· plant & algae eater',
};

const ORGANISM_TYPE_DESC = {
  'Microbes':                   'single-celled life',
  'Algae and phytoplankton':    'aquatic photosynthesizer',
  'Aquatic plants':             'submerged flora',
  'Aquatic invertebrates':      'boneless water organism',
  'Aquatic vertebrates':        'spined water animal',
  'Plants':                     'rooted photosynthesizer',
  'Terrestrial invertebrates':  'boneless land organism',
  'Terrestrial vertebrates':    'spined land animal',
  'Fungi':                      'spore-based organism',
};

const ROLE_DESC = {
  'producer':           'photosynthesizer',
  'herbivore':          'plant & algae eater',
  'predator':           'active hunter',
  'apex_predator':      'apex hunter',
  'scavenger':          'carrion eater',
  'filter_feeder':      'suspension feeder',
  'decomposer':         'matter recycler',
  'detritivore':        'decay consumer',
  'ecosystem_engineer': 'habitat shaper',
  'builder':            'habitat constructor',
  'mutualist':          'symbiont',
  'parasite':           'host feeder',
  'plague_swarm':       'forms massive swarms',
};

const BIOME_DESC = {
  'Desert':     'arid zone',
  'Farmland':   'cultivated land',
  'Floodplain': 'river lowland',
  'Forest':     'woodland',
  'Freshwater': 'lakes & rivers',
  'Grassland':  'open savanna',
  'Marine':     'open ocean',
  'Reef':       'hard coral zone',
  'Taiga':      'boreal forest',
  'Tundra':     'arctic plain',
  'Urban':      'built-up area',
  'Wetland':    'marsh & bog',
};

const MAIN_BIOME_ORDER = ['Marine', 'Forest', 'Grassland', 'Desert', 'Tundra'];

const BIOME_TO_MAIN = {
  marine: 'Marine',
  reef: 'Marine',
  freshwater: 'Marine',
  wetland: 'Marine',
  floodplain: 'Marine',

  forest: 'Forest',
  woodland: 'Forest',
  taiga: 'Forest',

  grassland: 'Grassland',
  savanna: 'Grassland',
  savannah: 'Grassland',
  'tropical savannah/grasslands': 'Grassland',
  farmland: 'Grassland',
  urban: 'Grassland',

  desert: 'Desert',
  tundra: 'Tundra',
};

function mapToMainBiome(label) {
  const key = String(label || '').trim().toLowerCase();
  if (BIOME_TO_MAIN[key]) return BIOME_TO_MAIN[key];

  // Fallback keyword matching so specific biome strings still collapse into the 5 main groups.
  if (key.includes('forest') || key.includes('taiga') || key.includes('woodland')) return 'Forest';
  if (key.includes('grassland') || key.includes('savanna') || key.includes('savannah') || key.includes('prairie') || key.includes('farmland') || key.includes('urban')) return 'Grassland';
  if (key.includes('desert') || key.includes('arid')) return 'Desert';
  if (key.includes('tundra') || key.includes('arctic') || key.includes('polar')) return 'Tundra';
  if (key.includes('marine') || key.includes('ocean') || key.includes('reef') || key.includes('freshwater') || key.includes('wetland') || key.includes('floodplain') || key.includes('river') || key.includes('lake')) return 'Marine';

  return null;
}

function addUnique(list, seen, value) {
  const v = String(value || '').trim();
  if (!v || seen.has(v)) return;
  seen.add(v);
  list.push(v);
}

function getBiomeField(cardBiomes) {
  const mainSet = new Set();
  const subList = [];
  const subSeen = new Set();
  const mainSetLabel = new Set(MAIN_BIOME_ORDER);

  for (const rawBiome of cardBiomes) {
    const biome = formatValue(rawBiome);
    const categoryMatch = biome.match(/^([^(]+)/);
    const category = categoryMatch ? categoryMatch[1].trim() : biome;
    const mappedMain = mapToMainBiome(category);

    if (mappedMain) {
      mainSet.add(mappedMain);
    }

    const descMatch = biome.match(/\(([^)]+)\)/);
    if (descMatch) {
      // Keep non-main category labels as specifics (e.g., Freshwater, Wetland).
      if (!mainSetLabel.has(category)) {
        addUnique(subList, subSeen, category);
      }

      const pieces = descMatch[1]
        .split(/[,&]|\s+and\s+/)
        .map(s => formatValue(s))
        .filter(Boolean);
      pieces.forEach((p) => {
        const pieceMain = mapToMainBiome(p);
        if (pieceMain) {
          mainSet.add(pieceMain);
        }
        addUnique(subList, subSeen, p);
      });
      continue;
    }

    if (mappedMain && category !== mappedMain) {
      addUnique(subList, subSeen, category);
      continue;
    }

    // Keep subtitle focused on specific biome variants/details, not the 5 main labels themselves.
    if (!mainSetLabel.has(category)) {
      addUnique(subList, subSeen, BIOME_DESC[category] || category);
    }
  }

  const main = MAIN_BIOME_ORDER.filter(label => mainSet.has(label)).join(', ');
  const sub = subList.length ? subList.join(' · ') : null;

  return { main, sub };
}

// Short clarifier appended after the specific type label
const TYPE_EXTRA = {
  // Microbes
  'bacterium':            '· prokaryotic microorganism',
  'archaeon':             '· ancient microbe',
  'protist':              '· single-celled eukaryote',
  // Algae
  'diatom':               '· silica-shelled algae',
  'dinoflagellate':       '· flagellate algae',
  'red algae':            '· marine algae',
  'haptophyte':           '· calcite-plated algae',
  'brown algae':          '· kelp-type algae',
  'green algae':          '· freshwater algae',
  // Fungi
  'lichen':               '· algae-fungus symbiont',
  'fungus':               '· spore-producing organism',
  // Plants
  'moss':                 '· non-vascular plant',
  'lycopsid':             '· scale-tree relative',
  'conifer':              '· cone-bearing tree',
  'fern':                 '· spore-bearing plant',
  'early vascular plant': '· first land plant',
  'vascular plant':       '· fluid-conducting plant',
  'monocot':              '· single-seed-leaf plant',
  'dicot':                '· two-seed-leaf plant',
  'flowering plant':      '· angiosperm',
  // Invertebrates
  'trilobite':            '· segmented arthropod',
  'coral':                '· reef-building polyp',
  'sponge':               '· filter-feeding animal',
  'crustacean':           '· shell-bearing arthropod',
  'gastropod':            '· coiled-shell mollusc',
  'bivalve':              '· two-shelled mollusc',
  'cephalopod':           '· tentacled mollusc',
  'crinoid':              '· stalked echinoderm',
  'anomalocarid':         '· early apex predator',
  'sea scorpion':         '· aquatic chelicerate',
  'brachiopod':           '· lamp-shelled animal',
  'annelid worm':         '· segmented worm',
  'echinoderm':           '· spiny-skinned animal',
  // Vertebrates
  'jawless fish':         '· boneless fish',
  'placoderm':            '· armoured jawed fish',
  'cartilaginous fish':   '· shark or ray',
  'ray-finned fish':      '· bony fish',
  'lobe-finned fish':     '· tetrapod ancestor',
  'amphibian':            '· land & water animal',
  'synapsid':             '· mammal-line reptile',
  'bird':                 '· feathered theropod',

  'reptile':              '· scaly amniote',
  'mammal':               '· warm-blooded amniote',
  // Arthropods
  'insect':               '· six-legged arthropod',
  'arachnid':             '· eight-legged arthropod',
  'segmented worm':       '· ringed invertebrate',

  // Plant / layered habitat variants
  'overstory layer':             '· upper tree canopy',
  'understory layer':            '· shaded lower-canopy plants',
  'shrub layer':                 '· woody mid-height plants',
  'bush layer':                  '· dense low woody growth',
  'herbaceous layer':            '· non-woody flowering plants',
  'ground cover layer':          '· low spreading soil cover',
  'vine layer':                  '· climbing or trailing plants',
  'root layer':                  '· below-ground plant structures',
  'jurassic layer':              '· mesozoic-adapted flora',
  'symbiotic powerhouse layer':  '· high-yield mutualist plants',
  'general layer':               '· broad habitat generalist',
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
  if (cls === 'Florideophyceae')   return 'red algae';
  if (cls === 'Prymnesiophyceae')  return 'haptophyte';
  if (cls === 'Phaeophyceae')      return 'brown algae';
  if (cls === 'Zygnematophyceae')  return 'green algae';

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
  // Accept both formal and simplified class labels present in configs.
  if (cls === 'Liliopsida' || cls === 'Monocots' || cls === 'Monocotyledonae') return 'monocot';
  if (cls === 'Magnoliopsida' || cls === 'Eudicots' || cls === 'Dicots' || cls === 'Dicotyledonae') return 'dicot';
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

function normalizeLeadDot(text) {
  return String(text || '').replace(/^\s*·\s*/, '').trim();
}

/**
 * Returns an ordered array of field row configs for a card.
 * Each entry: { label, main, sub, drawTop, drawBottom }
 */
module.exports = function getFieldDefinitions(card) {
  const fields = [];

  if (card.organism_type) {
    const parsed = parseField(card.organism_type);
    const typeMain = parsed.sub ? `${parsed.main} · ${parsed.sub}` : parsed.main;
    const isPlant = /^plant/i.test(String(parsed.main || ''));
    const layerLabel = parsed.sub || '';
    const hasPlantLayer = isPlant && !!layerLabel;

    const taxonomyType = getSpecificTypeDesc(card);
    const specificType = hasPlantLayer ? taxonomyType : (parsed.sub || taxonomyType);
    const typeExtra = specificType
      ? (TYPE_EXTRA[specificType] || TYPE_EXTRA[String(specificType).toLowerCase()] || '')
      : '';

    let typeSub = specificType ? (typeExtra ? `${specificType} ${typeExtra}` : specificType) : null;

    // For layered plant cards, prefer: layer meaning · growth form (e.g., "shaded lower-canopy plants · monocot").
    const layerExtra = TYPE_EXTRA[String(layerLabel).toLowerCase()] || TYPE_EXTRA[layerLabel] || '';
    const layerMeaning = normalizeLeadDot(layerExtra);
    if (isPlant && layerLabel && layerMeaning) {
      const growthType = taxonomyType && String(taxonomyType).toLowerCase() !== String(layerLabel).toLowerCase()
        ? taxonomyType
        : null;
      typeSub = growthType ? `${layerMeaning} · ${growthType}` : layerMeaning;
    }

    fields.push({
      label: 'Type',
      main:  typeMain,
      sub:   typeSub,
      drawTop:    require('./functional-category-background-top'),
      drawBottom: require('./functional-category-background-bottom'),
    });
  }

  if (card.biomes && card.biomes.length) {
    const biomeField = getBiomeField(card.biomes);
    fields.push({
      label: 'Biomes',
      main:  biomeField.main,
      sub:   biomeField.sub,
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
      const extra = parsed.sub ? (TROPHIC_SUB_EXTRA[parsed.sub.toLowerCase()] || '') : '';
      fields.push({
        label: 'Trophic Level',
        main:  parsed.main,
        sub:   parsed.sub ? (extra ? `${parsed.sub} ${extra}` : parsed.sub) : null,
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


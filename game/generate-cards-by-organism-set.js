#!/usr/bin/env node

/**
 * Generate cards for each organism set separately and organize them in Working Organism Cards folders.
 * Usage: node generate-cards-by-organism-set.js [options]
 * 
 * Options:
 *   --set <name>       Generate cards for a specific organism set (e.g., 'base-set', 'bushes')
 *   --dpi <num>        DPI for card rendering (default: 300)
 *   --noOpen           Don't auto-open files when done
 *   --printSafe        Hide crop/trim guides for final print
 *   --forceAll         Regenerate all cards even if unchanged
 */

const fs = require('fs');
const path = require('path');
const { writeEachCardPNG } = require('./lib/cards/layout-png');
const { ensureDir, autoOpen } = require('./lib/file');

const REPO_ROOT = path.resolve(__dirname, '..');
const CONFIG_DIR = path.resolve(REPO_ROOT, 'game/config');
const WORKING_CARDS_DIR = path.resolve(REPO_ROOT, 'output/Working Organism Cards');

// Mapping of config file names to folder names and display names
const ORGANISM_SETS = {
  'organisms.base-set': { folder: 'Organisms Base Set', label: 'Base Set' },
  'organisms.bushes': { folder: 'Bushes', label: 'Bushes' },
  'organisms.dangerous': { folder: 'Dangerous', label: 'Dangerous Organisms' },
  'organisms.ground-cover.plants': { folder: 'Ground-Cover Plants', label: 'Ground-Cover Plants' },
  'organisms.herbaceous.plants': { folder: 'Herbaceous Plants', label: 'Herbaceous Plants' },
  'organisms.hominids': { folder: 'Hominids', label: 'Hominids' },
  'organisms.jurassic': { folder: 'Jurassic Organisms', label: 'Jurassic Organisms' },
  'organisms.lichens.moss.fungi': { folder: 'Lichen Moss Fungi Organisms', label: 'Lichen Moss Fungi' },
  'organisms.microbes': { folder: 'Microbes', label: 'Microbes' },
  'organisms.overstory.plants': { folder: 'Overstory Plants', label: 'Overstory Plants' },
  'organisms.roots': { folder: 'Roots', label: 'Root Systems' },
  'organisms.shrubs': { folder: 'Shrubs', label: 'Shrubs' },
  'organisms.symbiotic-powerhouses': { folder: 'Symbiotic Powerhouse Organisms', label: 'Symbiotic Powerhouses' },
  'organisms.understory.plants': { folder: 'Understory Plants', label: 'Understory Plants' },
  'organisms.vines': { folder: 'Vines', label: 'Vines' },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    set: null,
    dpi: 300,
    noOpen: false,
    printSafe: false,
    forceAll: false,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--set' && args[i + 1]) opts.set = args[++i];
    else if (a === '--dpi' && args[i + 1]) {
      const parsed = Number(args[++i]);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error('--dpi must be a positive number');
      }
      opts.dpi = parsed;
    }
    else if (a === '--noOpen') opts.noOpen = true;
    else if (a === '--printSafe') opts.printSafe = true;
    else if (a === '--forceAll') opts.forceAll = true;
  }

  return opts;
}

function findOrganismSetConfigs() {
  const configs = [];
  for (const file of fs.readdirSync(CONFIG_DIR)) {
    if (!file.startsWith('organisms.') || !file.endsWith('.json')) continue;
    if (file === 'organisms.json') continue; // Skip main organisms.json
    configs.push(file.replace('.json', ''));
  }
  return configs.sort();
}

function loadOrganisms(configName) {
  const configPath = path.join(CONFIG_DIR, `${configName}.json`);
  const raw = fs.readFileSync(configPath, 'utf8');
  const data = JSON.parse(raw);
  
  // Handle different config formats
  let organisms = data.organisms || data.cards || [];
  
  return organisms;
}

function normalizeOrganism(organism, index, totalCount) {
  // Handle both card and organism formats
  const cardNum = String(index + 1).padStart(String(totalCount).length, '0');
  
  return {
    id: organism.id || organism.scientific_name || `organism-${index + 1}`,
    card_label: organism.card_label || `Card ${cardNum}`,
    common_name: organism.common_name || organism.name || 'Unknown',
    scientific_name: organism.scientific_name || '',
    organism_type: organism.organism_type || organism.broadType || 'Organism',
    kingdom: organism.kingdom || 'Unknown',
    phylum: organism.phylum || null,
    class: organism.class || null,
    order: organism.order || null,
    family: organism.family || null,
    genus: organism.genus || null,
    species: organism.species || null,
    biomes: Array.isArray(organism.biomes) ? organism.biomes : [organism.biome || 'Unknown'],
    eras: Array.isArray(organism.eras) ? organism.eras : [organism.era || 'Unknown'],
    periods: Array.isArray(organism.periods) ? organism.periods : [organism.period || 'Unknown'],
    trophic_level: organism.trophic_level || 'Unknown',
    role: Array.isArray(organism.roles) ? organism.roles : (organism.role || []),
    effects: organism.effects || { oxygen: 0, co2: 0, biodiversity: 0 },
    dna_sequence: organism.dna_sequence || null,
    main_photo: organism.main_photo || null,
    notes: organism.notes || '',
  };
}

async function generateSetCards(configName, opts) {
  const setInfo = ORGANISM_SETS[configName];
  if (!setInfo) {
    console.warn(`⚠️  Unknown organism set: ${configName}`);
    return false;
  }

  try {
    console.log(`\n📚 Generating cards for: ${setInfo.label}`);
    
    // Load organisms
    const organisms = loadOrganisms(configName);
    if (!organisms.length) {
      console.log(`   ⊘ No organisms found in ${configName}`);
      return true;
    }

    // Normalize to card format
    const cards = organisms.map((org, idx) => normalizeOrganism(org, idx, organisms.length));

    // Create output directory
    const outDir = path.join(WORKING_CARDS_DIR, setInfo.folder);
    ensureDir(outDir);

    // Generate PNG cards (each as individual file)
    await writeEachCardPNG(cards, outDir, {
      dpi: opts.dpi,
      includeGuides: !opts.printSafe,
    });

    console.log(`   ✓ Generated ${cards.length} cards → ${setInfo.folder}/`);

    if (!opts.noOpen) {
      autoOpen(outDir);
    }

    return true;
  } catch (err) {
    console.error(`   ✗ Error: ${err.message}`);
    return false;
  }
}

(async function main() {
  try {
    const opts = parseArgs();
    
    console.log('🎴 Cycles of Survival: Generate Cards by Organism Set');
    console.log('═'.repeat(60));

    ensureDir(WORKING_CARDS_DIR);

    let setsToProcess;
    if (opts.set) {
      // Generate specific set
      const configName = opts.set.startsWith('organisms.') ? opts.set : `organisms.${opts.set}`;
      setsToProcess = [configName];
    } else {
      // Generate all sets
      setsToProcess = findOrganismSetConfigs();
    }

    if (!setsToProcess.length) {
      console.log('❌ No organism sets found');
      process.exit(1);
    }

    let successCount = 0;
    for (const configName of setsToProcess) {
      const success = await generateSetCards(configName, opts);
      if (success) successCount++;
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Complete: ${successCount}/${setsToProcess.length} sets generated successfully`);
    console.log(`📁 Output: ${WORKING_CARDS_DIR}\n`);

  } catch (err) {
    console.error('❌ Failed to generate cards:', err.message);
    process.exit(1);
  }
})();

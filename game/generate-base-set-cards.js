#!/usr/bin/env node

/**
 * Renders base-set organism cards directly (no copy-from-working step).
 * Source of truth:
 * - Full organism data from organisms.json
 * - Base-set inclusion/order from organisms.base-set.json
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { ensureDir } = require('./lib/file');
const { writeEachCardPNG } = require('./lib/cards/layout-each');
const { CATEGORY_COLORS } = require('./lib/cards/layers/title-color-block');

const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    fullConfig: 'game/config/organisms.json',
    baseSetConfig: 'game/config/organisms.base-set.json',
    outDir: 'Output/Organisms Base Set',
    safeDir: 'saved_files/Working Organism Cards/Organisms Base Set',
    legacyDir: 'Output/Organisms Base Set',
    forceAll: false,
    printSafe: false,
    dpi: 300,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--fullConfig' && args[i + 1]) opts.fullConfig = args[++i];
    else if (a === '--baseSetConfig' && args[i + 1]) opts.baseSetConfig = args[++i];
    else if (a === '--outDir' && args[i + 1]) opts.outDir = args[++i];
    else if (a === '--safeDir' && args[i + 1]) opts.safeDir = args[++i];
    else if (a === '--legacyDir' && args[i + 1]) opts.legacyDir = args[++i];
    else if (a === '--forceAll') opts.forceAll = true;
    else if (a === '--printSafe') opts.printSafe = true;
    else if (a === '--dpi' && args[i + 1]) {
      const parsed = Number(args[++i]);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error('--dpi must be a positive number');
      }
      opts.dpi = parsed;
    }
  }

  return opts;
}

function readJson(relPath) {
  const abs = path.resolve(REPO_ROOT, relPath);
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

function loadFullOrganisms(relPath) {
  const data = readJson(relPath);
  if (!Array.isArray(data.organisms)) {
    throw new Error(`${relPath} must contain an array field: organisms`);
  }
  return data.organisms;
}

function loadBaseSetTargets(relPath) {
  const data = readJson(relPath);
  const targets = [];

  if (Array.isArray(data.organisms)) {
    targets.push(...data.organisms);
  }

  const habitatArrays = [
    'forestOrganismsByPeriod',
    'desertOrganismsByPeriod',
    'grasslandOrganismsByPeriod',
    'marineOrganismsByPeriod',
    'tundraOrganismsByPeriod',
  ];

  for (const key of habitatArrays) {
    const periods = Array.isArray(data[key]) ? data[key] : [];
    for (const periodBlock of periods) {
      const orgs = Array.isArray(periodBlock.organisms) ? periodBlock.organisms : [];
      for (const org of orgs) {
        targets.push({
          ...org,
          common_name: org.common_name || org.name,
          scientific_name: org.scientific_name || org.name,
        });
      }
    }
  }

  return targets;
}

function canonical(value) {
  return String(value || '').trim().toLowerCase();
}

function getCardNumberFromLabel(cardLabel) {
  const match = String(cardLabel || '').match(/card\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function getOrderedCardBaseName(cardLabel, fallbackIndex, totalCards) {
  const digits = Math.max(3, String(totalCards).length);
  const cardNumber = getCardNumberFromLabel(cardLabel);
  const resolvedNumber = Number.isInteger(cardNumber) && cardNumber > 0
    ? cardNumber
    : fallbackIndex + 1;
  return `card-${String(resolvedNumber).padStart(digits, '0')}`;
}

function withPhotoExtensions(fileBase) {
  const noExt = String(fileBase || '').replace(/\.[^.]+$/, '');
  return [
    `${noExt}.png`,
    `${noExt}.jpg`,
    `${noExt}.jpeg`,
    `${noExt}.webp`,
  ];
}

function buildMainPhotoCandidates(card) {
  const explicit = (card && card.main_photo) || '';
  const scientific = (card && card.scientific_name) || '';
  const trimmedScientific = scientific.trim();
  const noTrailingDot = trimmedScientific.replace(/\.+$/, '');

  const candidates = [];
  if (explicit) candidates.push(explicit);
  if (trimmedScientific) {
    candidates.push(`${trimmedScientific}.png`);
    candidates.push(`${trimmedScientific.replace(/\s+/g, '_')}.png`);
  }
  if (noTrailingDot && noTrailingDot !== trimmedScientific) {
    candidates.push(`${noTrailingDot}.png`);
    candidates.push(`${noTrailingDot.replace(/\s+/g, '_')}.png`);
  }

  const expanded = [];
  for (const candidate of candidates) {
    expanded.push(candidate);
    for (const variant of withPhotoExtensions(candidate)) expanded.push(variant);
  }

  const seen = new Set();
  return expanded.filter((name) => {
    const key = canonical(name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getMainPhotoAssetSignature(card) {
  const photoDir = path.resolve(__dirname, './lib/cards/layers/main-photo');
  const candidates = buildMainPhotoCandidates(card);
  if (!candidates.length) return null;

  for (const photoFile of candidates) {
    const photoPath = path.resolve(photoDir, photoFile);
    try {
      const stats = fs.statSync(photoPath);
      return {
        file: photoFile,
        size: stats.size,
        mtimeMs: Math.trunc(stats.mtimeMs),
      };
    } catch (_) {
      // continue
    }
  }

  return { file: candidates[0], missing: true };
}

function getLayoutCodeChecksum() {
  const hash = crypto.createHash('md5');
  const roots = [
    path.resolve(__dirname, './lib/cards/layout-png.js'),
    path.resolve(__dirname, './lib/cards/layers'),
  ];

  function appendPath(targetPath) {
    let stats;
    try {
      stats = fs.statSync(targetPath);
    } catch (_) {
      return;
    }

    if (stats.isDirectory()) {
      for (const entry of fs.readdirSync(targetPath).sort()) {
        appendPath(path.join(targetPath, entry));
      }
      return;
    }

    if (!targetPath.endsWith('.js')) return;
    hash.update(path.relative(__dirname, targetPath));
    hash.update(fs.readFileSync(targetPath, 'utf8'));
  }

  for (const root of roots) appendPath(root);
  return hash.digest('hex');
}

function cardSignature(card) {
  return JSON.stringify({
    id: card.id,
    card_label: card.card_label,
    common_name: card.common_name,
    scientific_name: card.scientific_name,
    main_photo: card.main_photo,
    organism_type: card.organism_type,
    kingdom: card.kingdom,
    phylum: card.phylum,
    class: card.class,
    order: card.order,
    family: card.family,
    genus: card.genus,
    species: card.species,
    biomes: card.biomes,
    eras: card.eras,
    periods: card.periods,
    trophic_level: card.trophic_level,
    role: card.role,
    dna_sequence: card.dna_sequence,
    effects: card.effects,
    dna_source: card.dna_source,
    main_photo_asset: getMainPhotoAssetSignature(card),
  });
}

function loadManifest(manifestPath) {
  try {
    if (!fs.existsSync(manifestPath)) return {};
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (_) {
    return {};
  }
}

function getManifestRecord(manifest, cardId) {
  const cards = manifest && manifest._cards ? manifest._cards : manifest;
  if (!cards || !Object.prototype.hasOwnProperty.call(cards, cardId)) return null;
  const rec = cards[cardId];
  if (typeof rec === 'string') return { signature: rec, fileName: null };
  return rec;
}

function atomicWriteJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  const tmp = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, filePath);
}

function removeUnexpectedPNGs(dirPath, expectedFiles) {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath)) {
    if (!entry.toLowerCase().endsWith('.png')) continue;
    if (expectedFiles.has(entry)) continue;
    fs.unlinkSync(path.join(dirPath, entry));
  }
}

function syncDirectoryFiles(sourceDir, targetDir, fileNames) {
  ensureDir(targetDir);
  for (const fileName of fileNames) {
    fs.copyFileSync(path.join(sourceDir, fileName), path.join(targetDir, fileName));
  }
}

function buildFullLookup(fullOrganisms) {
  const byScientific = new Map();
  const byCommon = new Map();
  const byLabel = new Map();

  for (const org of fullOrganisms) {
    const sci = canonical(org.scientific_name);
    const common = canonical(org.common_name || org.name);
    const label = canonical(org.card_label);
    if (sci && !byScientific.has(sci)) byScientific.set(sci, org);
    if (common && !byCommon.has(common)) byCommon.set(common, org);
    if (label && !byLabel.has(label)) byLabel.set(label, org);
  }

  return { byScientific, byCommon, byLabel };
}

function resolveBaseSetCards(fullOrganisms, baseTargets) {
  const lookup = buildFullLookup(fullOrganisms);
  const cards = [];

  baseTargets.forEach((target, index) => {
    const sci = canonical(target.scientific_name);
    const common = canonical(target.common_name || target.name);
    const label = canonical(target.card_label);

    const source = lookup.byScientific.get(sci)
      || lookup.byCommon.get(common)
      || lookup.byLabel.get(label)
      || target;

    cards.push({ ...source });
  });

  return cards;
}

function normalizeCard(source, index, totalCards) {
  const organismType = source.organism_type || source.broadType || 'Organism';
  const fileName = getOrderedCardBaseName(source.card_label || `Card ${index + 1}`, index, totalCards);

  return {
    ...source,
    id: source.id || source.scientific_name || `base-set-${index + 1}`,
    fileName,
    card_label: source.card_label || `Card ${index + 1}`,
    common_name: source.common_name || source.name || 'Unknown',
    scientific_name: source.scientific_name || source.name || '',
    main_photo: source.main_photo || null,
    organism_type: organismType,
    kingdom: source.kingdom || 'Unknown',
    phylum: source.phylum || null,
    class: source.class || null,
    order: source.order || null,
    family: source.family || null,
    genus: source.genus || null,
    species: source.species || null,
    biomes: Array.isArray(source.biomes) ? source.biomes : (source.biome ? [source.biome] : []),
    eras: Array.isArray(source.eras) ? source.eras : (source.era ? [source.era] : []),
    periods: Array.isArray(source.periods) ? source.periods : (source.period ? [source.period] : []),
    trophic_level: source.trophic_level || 'Unknown',
    role: Array.isArray(source.role) ? source.role : (Array.isArray(source.roles) ? source.roles : (source.role ? [source.role] : [])),
    dna_sequence: source.dna_sequence || null,
    effects: source.effects || { oxygen: 0, co2: 0, biodiversity: 0 },
    waterRequirement: Number.isFinite(source.waterRequirement) ? source.waterRequirement : 0,
    neonColor: CATEGORY_COLORS[organismType] || '#02BDF2',
    titleColor: '#000000',
    background: '#FFFFFF',
  };
}

(async function main() {
  try {
    const opts = parseArgs();

    const outDir = path.resolve(REPO_ROOT, opts.outDir);
    const safeDir = path.resolve(REPO_ROOT, opts.safeDir);
    const legacyDir = opts.legacyDir ? path.resolve(REPO_ROOT, opts.legacyDir) : null;

    ensureDir(outDir);
    ensureDir(safeDir);
    if (legacyDir) ensureDir(legacyDir);

    const fullOrganisms = loadFullOrganisms(opts.fullConfig);
    const baseTargets = loadBaseSetTargets(opts.baseSetConfig);
    const resolved = resolveBaseSetCards(fullOrganisms, baseTargets);
    const cards = resolved.map((card, index) => normalizeCard(card, index, resolved.length));

    const manifestPath = path.join(outDir, '.manifest.json');
    const safeManifestPath = path.join(safeDir, '.manifest.json');
    const prevManifest = loadManifest(manifestPath);
    const fallbackManifest = loadManifest(safeManifestPath);
    const activeManifest = Object.keys(prevManifest).length ? prevManifest : fallbackManifest;

    const currentCodeChecksum = getLayoutCodeChecksum();

    const expectedFiles = new Set(cards.map((card) => `${card.fileName}.png`));
    const cardsToRender = opts.forceAll
      ? cards
      : cards.filter((card) => {
          if (activeManifest._codeChecksum !== currentCodeChecksum) return true;
          const sig = cardSignature(card);
          const prev = getManifestRecord(activeManifest, card.id);
          const fileName = `${card.fileName}.png`;
          if (!prev || prev.signature !== sig) return true;
          return !fs.existsSync(path.join(outDir, fileName)) || !fs.existsSync(path.join(safeDir, fileName));
        });

    if (cardsToRender.length) {
      console.log(`Rendering ${cardsToRender.length} of ${cards.length} base-set cards (${opts.forceAll ? 'force-all' : 'changed only'})...`);
      await writeEachCardPNG(cardsToRender, outDir, {
        dpi: opts.dpi,
        includeGuides: !opts.printSafe,
      });
    } else {
      console.log('No base-set changes detected. Verifying mirrors...');
    }

    const sortedFiles = Array.from(expectedFiles).sort();
    syncDirectoryFiles(outDir, safeDir, sortedFiles);
    if (legacyDir) syncDirectoryFiles(outDir, legacyDir, sortedFiles);

    removeUnexpectedPNGs(outDir, expectedFiles);
    removeUnexpectedPNGs(safeDir, expectedFiles);
    if (legacyDir) removeUnexpectedPNGs(legacyDir, expectedFiles);

    const newManifest = {
      _codeChecksum: currentCodeChecksum,
      _generatedAt: new Date().toISOString(),
      _paths: {
        outDir,
        safeDir,
      },
      _cards: {},
    };

    for (const card of cards) {
      newManifest._cards[card.id] = {
        signature: cardSignature(card),
        fileName: `${card.fileName}.png`,
      };
    }

    atomicWriteJson(manifestPath, newManifest);
    atomicWriteJson(safeManifestPath, newManifest);
    if (legacyDir) {
      atomicWriteJson(path.join(legacyDir, '.manifest.json'), newManifest);
    }

    console.log(`✓ Base set generated in ${outDir}`);
    console.log(`✓ Mirrored to ${safeDir}`);
    if (legacyDir) console.log(`✓ Mirrored to ${legacyDir}`);
  } catch (err) {
    console.error('Failed to generate base-set cards directly:', err.message);
    process.exit(1);
  }
})();

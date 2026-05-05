#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { writeEachCardPNG, getEachCardBaseName } = require('./lib/cards/layout-png');
const { ensureDir } = require('./lib/file');

const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    config: 'game/config/organisms.json',
    outDir: 'Output/working organisms',
    safeDir: 'saved_files/Working Organism Cards/current',
    legacyDir: 'Output/working organisms',
    noOpen: true,
    printSafe: false,
    forceAll: false,
    dpi: 300,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--config' && args[i + 1]) opts.config = args[++i];
    else if (a === '--outDir' && args[i + 1]) opts.outDir = args[++i];
    else if (a === '--safeDir' && args[i + 1]) opts.safeDir = args[++i];
    else if (a === '--legacyDir' && args[i + 1]) opts.legacyDir = args[++i];
    else if (a === '--open') opts.noOpen = false;
    else if (a === '--printSafe') opts.printSafe = true;
    else if (a === '--forceAll') opts.forceAll = true;
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

function loadOrganisms(configPath) {
  const abs = path.resolve(REPO_ROOT, configPath);
  const raw = fs.readFileSync(abs, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.organisms)) throw new Error('organisms.json must contain an array field: organisms');
  return data.organisms;
}

function withPhotoExtensions(fileBase) {
  const noExt = fileBase.replace(/\.[^.]+$/, '');
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
    for (const variant of withPhotoExtensions(candidate)) {
      expanded.push(variant);
    }
  }

  const seen = new Set();
  return expanded.filter((name) => {
    const key = name.toLowerCase();
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
    } catch (err) {
      // Continue until we find the first real asset match.
    }
  }

  return {
    file: candidates[0],
    missing: true,
  };
}

function getCardFileName(card) {
  return `${getEachCardBaseName(card)}.png`;
}

function getCardNumberFromLabel(cardLabel) {
  const match = String(cardLabel || '').match(/card\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function getOrderedCardBaseName(cardLabel, fallbackIndex, totalCards) {
  const digits = Math.max(2, String(totalCards).length);
  const cardNumber = getCardNumberFromLabel(cardLabel);
  const resolvedNumber = Number.isInteger(cardNumber) && cardNumber > 0
    ? cardNumber
    : fallbackIndex + 1;
  return `card-${String(resolvedNumber).padStart(digits, '0')}`;
}

function atomicWriteJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  const tempPath = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, filePath);
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
  if (!cards || !Object.prototype.hasOwnProperty.call(cards, cardId)) {
    return null;
  }

  const record = cards[cardId];
  if (typeof record === 'string') {
    return { signature: record, fileName: null };
  }

  return record;
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
    const sourcePath = path.join(sourceDir, fileName);
    const targetPath = path.join(targetDir, fileName);
    fs.copyFileSync(sourcePath, targetPath);
  }
}

(async function main() {
  try {
    const opts = parseArgs();
    const organisms = loadOrganisms(opts.config);
    const outDir = path.resolve(REPO_ROOT, opts.outDir);
    const safeDir = path.resolve(REPO_ROOT, opts.safeDir);
    const legacyDir = opts.legacyDir ? path.resolve(REPO_ROOT, opts.legacyDir) : null;
    ensureDir(outDir);
    ensureDir(safeDir);
    if (legacyDir) ensureDir(legacyDir);

    // Use getBadgeGeometry from layout-png.js for badge/connector placement
    const { getBadgeGeometry } = require('./lib/cards/layout-png');
    const { badgeRadius, badgeTextGap, leftPadding, badgeStartX } = getBadgeGeometry(1);

    // Import CATEGORY_COLORS for neonColor mapping
    const { CATEGORY_COLORS } = require('./lib/cards/layers/title-color-block');
    const cards = organisms.map((organism, index) => {
      const organism_type = organism.organism_type || '';
      const neonColor = CATEGORY_COLORS[organism_type] || '#02BDF2';
      return {
        ...organism,
        id: organism.id || `organism-${index + 1}`,
        card_label: organism.card_label || `Card ${index + 1}`,
        common_name: organism.common_name || '',
        scientific_name: organism.scientific_name || '',
        organism_type,
        neonColor,
        titleColor: '#000000',
        background: '#FFFFFF',
        fileName: getOrderedCardBaseName(organism.card_label || `Card ${index + 1}`, index, organisms.length)
      };
    });

    const manifestPath = path.join(outDir, '.manifest.json');
    const safeManifestPath = path.join(safeDir, '.manifest.json');
    const previousManifest = loadManifest(manifestPath);
    const fallbackManifest = loadManifest(safeManifestPath);
    const activeManifest = Object.keys(previousManifest).length ? previousManifest : fallbackManifest;

    // Signature includes all render-driving card fields so only changed cards regenerate.
    function cardSignature(card) {
      return JSON.stringify({
        id: card.id,
        common_name: card.common_name,
        scientific_name: card.scientific_name,
        card_label: card.card_label,
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

    // Calculate checksum of layout + layer code so any code changes trigger rebuild
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

        if (!targetPath.endsWith('.js')) {
          return;
        }

        hash.update(path.relative(__dirname, targetPath));
        hash.update(fs.readFileSync(targetPath, 'utf8'));
      }

      for (const root of roots) {
        appendPath(root);
      }

      return hash.digest('hex');
    }

    const currentCodeChecksum = getLayoutCodeChecksum();
    const expectedFiles = new Set(cards.map(getCardFileName));

    // Filter to only cards that changed
    const cardsToRender = opts.forceAll ? cards : cards.filter(card => {
      // If code changed, regenerate all
      if (activeManifest._codeChecksum !== currentCodeChecksum) {
        return true;
      }

      const sig = cardSignature(card);
      const prevRecord = getManifestRecord(activeManifest, card.id);
      const fileName = getCardFileName(card);
      if (!prevRecord || sig !== prevRecord.signature) {
        return true;
      }

      return !fs.existsSync(path.join(outDir, fileName)) || !fs.existsSync(path.join(safeDir, fileName));
    });

    if (cardsToRender.length > 0) {
      console.log(`Rendering ${cardsToRender.length} of ${cards.length} cards (${opts.forceAll ? 'force-all' : 'changed only'})...`);
      if (cardsToRender.length < cards.length) {
        console.log(`Changed cards: ${cardsToRender.map(c => c.card_label).join(', ')}`);
      }

      await writeEachCardPNG(cardsToRender, outDir, {
        includeGuides: !opts.printSafe,
        dpi: opts.dpi,
      });
    } else {
      console.log('No card content changes detected. Verifying current and safe sets...');
    }

    syncDirectoryFiles(outDir, safeDir, Array.from(expectedFiles).sort());
    if (legacyDir) {
      syncDirectoryFiles(outDir, legacyDir, Array.from(expectedFiles).sort());
    }
    removeUnexpectedPNGs(outDir, expectedFiles);
    removeUnexpectedPNGs(safeDir, expectedFiles);
    if (legacyDir) {
      removeUnexpectedPNGs(legacyDir, expectedFiles);
    }

    const newManifest = {
      _codeChecksum: currentCodeChecksum,
      _generatedAt: new Date().toISOString(),
      _paths: {
        current: outDir,
        safe: safeDir,
      },
      _cards: {},
    };
    for (const card of cards) {
      newManifest._cards[card.id] = {
        signature: cardSignature(card),
        fileName: getCardFileName(card),
      };
    }
    atomicWriteJson(manifestPath, newManifest);
    atomicWriteJson(safeManifestPath, newManifest);
    if (legacyDir) {
      atomicWriteJson(path.join(legacyDir, '.manifest.json'), newManifest);
    }

    console.log(`✓ Current set updated in ${outDir}`);
    console.log(`✓ Safe set mirrored in ${safeDir}`);
    if (legacyDir) {
      console.log(`✓ Legacy set mirrored in ${legacyDir}`);
    }
    if (cardsToRender.length <= 5) {
      if (cardsToRender.length > 0) {
        console.log(`  Changed: ${cardsToRender.map(c => c.card_label).join(', ')}`);
      }
    }
  } catch (err) {
    console.error('Failed to generate working organism cards:', err.message);
    process.exit(1);
  }
})();

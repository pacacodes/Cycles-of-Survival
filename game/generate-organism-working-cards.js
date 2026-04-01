#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { writeEachCardPNG } = require('./lib/cards/layout-png');
const { ensureDir, slugify } = require('./lib/file');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    config: 'game/config/organisms.json',
    outDir: 'output/Working Organism Cards',
    noOpen: true,
    printSafe: false,
    forceAll: false,
    dpi: 300,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--config' && args[i + 1]) opts.config = args[++i];
    else if (a === '--outDir' && args[i + 1]) opts.outDir = args[++i];
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
  const abs = path.resolve(process.cwd(), configPath);
  const raw = fs.readFileSync(abs, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.organisms)) throw new Error('organisms.json must contain an array field: organisms');
  return data.organisms;
}

function getMainPhotoAssetSignature(card) {
  const photoFile = (card && card.main_photo) || (card && card.scientific_name ? `${card.scientific_name}.png` : '');
  if (!photoFile) {
    return null;
  }

  const photoPath = path.resolve(__dirname, './lib/cards/layers/main-photo', photoFile);
  try {
    const stats = fs.statSync(photoPath);
    return {
      file: photoFile,
      size: stats.size,
      mtimeMs: Math.trunc(stats.mtimeMs),
    };
  } catch (err) {
    return {
      file: photoFile,
      missing: true,
    };
  }
}

(async function main() {
  try {
    const opts = parseArgs();
    const organisms = loadOrganisms(opts.config);
    const outDir = path.resolve(process.cwd(), opts.outDir);
    ensureDir(outDir);

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
        fileName: `${slugify(organism.card_label || `card-${index + 1}`)}`
      };
    });

    // Load previous manifest for change detection
    const manifestPath = path.join(outDir, '.manifest.json');
    let previousManifest = {};
    try {
      if (fs.existsSync(manifestPath)) {
        const manifestJson = fs.readFileSync(manifestPath, 'utf8');
        previousManifest = JSON.parse(manifestJson);
      }
    } catch (err) {
      // Start fresh if manifest is corrupted
    }

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
        dna_sequence: card.dna_sequence,
        effects: card.effects,
        dna_source: card.dna_source,
        main_photo_asset: getMainPhotoAssetSignature(card),
      });
    }

    // Calculate checksum of layout + layer code so any code changes trigger rebuild
    const crypto = require('crypto');
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

    // Filter to only cards that changed
    const cardsToRender = opts.forceAll ? cards : cards.filter(card => {
      // If code changed, regenerate all
      if (previousManifest._codeChecksum !== currentCodeChecksum) {
        return true;
      }
      const sig = cardSignature(card);
      const prevSig = previousManifest[card.id];
      return sig !== prevSig;
    });

    if (cardsToRender.length === 0) {
      console.log('No changes detected. All cards up to date.');
      return;
    }

    console.log(`Rendering ${cardsToRender.length} of ${cards.length} cards (${opts.forceAll ? 'force-all' : 'changed only'})...`);
    if (cardsToRender.length < cards.length) {
      console.log(`Changed cards: ${cardsToRender.map(c => c.card_label).join(', ')}`);
    }

    await writeEachCardPNG(cardsToRender, outDir, {
      includeGuides: !opts.printSafe,
      dpi: opts.dpi,
    });

    // Update manifest
    const newManifest = {
      _codeChecksum: currentCodeChecksum,
    };
    for (const card of cards) {
      newManifest[card.id] = cardSignature(card);
    }
    fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2));

    console.log(`✓ Regenerated ${cardsToRender.length} working organism cards`);
    if (cardsToRender.length <= 5) {
      console.log(`  Changed: ${cardsToRender.map(c => c.card_label).join(', ')}`);
    }
  } catch (err) {
    console.error('Failed to generate working organism cards:', err.message);
    process.exit(1);
  }
})();

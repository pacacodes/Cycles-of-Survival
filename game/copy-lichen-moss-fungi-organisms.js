#!/usr/bin/env node
/**
 * Copies Lichen, Moss, and Fungi organism card PNGs from the working organisms output folder
 * instead of re-rendering them. The working organisms must be generated first.
 */

const fs = require('fs');
const path = require('path');
const { getEachCardBaseName } = require('./lib/cards/layout-png');
const { ensureDir } = require('./lib/file');

const REPO_ROOT = path.resolve(__dirname, '..');

// Card numbers for Lichen, Moss, and Fungi organisms
const LICHEN_MOSS_FUNGI_CARDS = new Set([
  15, 80, 82, 133, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306
]);

function parseArgs() {
  const opts = {
    workingConfig: 'game/config/organisms.json',
    workingDir: 'output/Working Organism Cards/current',
    outDir: 'output/Working Organism Cards/Lichen Moss Fungi Organisms',
    safeDir: 'saved_files/Working Organism Cards/Lichen Moss Fungi Organisms',
    legacyDir: 'Output/Lichen Moss Fungi Organisms',
  };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--workingConfig' && args[i + 1]) opts.workingConfig = args[++i];
    else if (a === '--workingDir' && args[i + 1]) opts.workingDir = args[++i];
    else if (a === '--outDir' && args[i + 1]) opts.outDir = args[++i];
    else if (a === '--safeDir' && args[i + 1]) opts.safeDir = args[++i];
    else if (a === '--legacyDir' && args[i + 1]) opts.legacyDir = args[++i];
  }
  return opts;
}

function loadOrganisms(configPath) {
  const abs = path.resolve(REPO_ROOT, configPath);
  const raw = fs.readFileSync(abs, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.organisms)) throw new Error(`${configPath} must contain an array field: organisms`);
  return data.organisms;
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

function removeUnexpectedPNGs(dirPath, expectedFiles) {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath)) {
    if (!entry.toLowerCase().endsWith('.png')) continue;
    if (expectedFiles.has(entry)) continue;
    fs.unlinkSync(path.join(dirPath, entry));
  }
}

(async function main() {
  try {
    const opts = parseArgs();

    const workingOrganisms = loadOrganisms(opts.workingConfig);

    const workingDir = path.resolve(REPO_ROOT, opts.workingDir);
    const outDir = path.resolve(REPO_ROOT, opts.outDir);
    const safeDir = path.resolve(REPO_ROOT, opts.safeDir);
    const legacyDir = opts.legacyDir ? path.resolve(REPO_ROOT, opts.legacyDir) : null;

    // Build card_label → filename map from working organisms (uses working total for padding)
    const workingTotal = workingOrganisms.length;
    const labelToWorkingFile = new Map();
    workingOrganisms.forEach((org, index) => {
      const label = (org.card_label || `Card ${index + 1}`).trim().toLowerCase();
      const fileName = `${getOrderedCardBaseName(org.card_label || `Card ${index + 1}`, index, workingTotal)}.png`;
      labelToWorkingFile.set(label, fileName);
    });

    ensureDir(outDir);
    ensureDir(safeDir);
    if (legacyDir) ensureDir(legacyDir);

    const expectedFiles = new Set();
    const missing = [];

    // Filter for Lichen, Moss, Fungi organisms
    const lichenMossFungiOrganisms = workingOrganisms.filter(org => {
      const cardNum = getCardNumberFromLabel(org.card_label);
      return LICHEN_MOSS_FUNGI_CARDS.has(cardNum);
    });

    for (const org of lichenMossFungiOrganisms) {
      const label = (org.card_label || '').trim().toLowerCase();
      const workingFile = labelToWorkingFile.get(label);
      if (!workingFile) {
        missing.push(org.card_label || org.common_name || '(unknown)');
        continue;
      }

      const sourcePath = path.join(workingDir, workingFile);
      if (!fs.existsSync(sourcePath)) {
        missing.push(`${org.card_label} (file not found: ${workingFile})`);
        continue;
      }

      expectedFiles.add(workingFile);
      fs.copyFileSync(sourcePath, path.join(outDir, workingFile));
      fs.copyFileSync(sourcePath, path.join(safeDir, workingFile));
      if (legacyDir) {
        fs.copyFileSync(sourcePath, path.join(legacyDir, workingFile));
      }
    }

    removeUnexpectedPNGs(outDir, expectedFiles);
    removeUnexpectedPNGs(safeDir, expectedFiles);
    if (legacyDir) removeUnexpectedPNGs(legacyDir, expectedFiles);

    if (missing.length > 0) {
      console.warn(`⚠ Could not copy ${missing.length} Lichen/Moss/Fungi card(s) — run generate:organisms:working first:`);
      for (const m of missing) console.warn(`  - ${m}`);
    }

    console.log(`✓ Copied ${expectedFiles.size} Lichen/Moss/Fungi cards to ${outDir}`);
    console.log(`✓ Mirrored to ${safeDir}`);
    if (legacyDir) console.log(`✓ Mirrored to ${legacyDir}`);
  } catch (err) {
    console.error('Failed to copy Lichen/Moss/Fungi cards:', err.message);
    process.exit(1);
  }
})();

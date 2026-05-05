#!/usr/bin/env node
/**
 * Copies Symbiotic Powerhouse organism card PNGs from the working organisms output folder
 * instead of re-rendering them. The working organisms must be generated first.
 */

const fs = require('fs');
const path = require('path');

const { ensureDir } = require('./lib/file');

const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs() {
  const opts = {
    workingConfig: 'game/config/organisms.json',
    symbioticConfig: 'game/config/organisms.symbiotic-powerhouses.json',
    workingDir: 'Output/working organisms',
    outDir: 'Output/Symbiotic Powerhouse Organisms',
    safeDir: 'saved_files/Working Organism Cards/Symbiotic Powerhouse Organisms',
    legacyDir: 'Output/Symbiotic Powerhouse Organisms',
  };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--workingConfig' && args[i + 1]) opts.workingConfig = args[++i];
    else if (a === '--symbioticConfig' && args[i + 1]) opts.symbioticConfig = args[++i];
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
    const symbioticPowerhouses = loadOrganisms(opts.symbioticConfig);

    const workingDir = path.resolve(REPO_ROOT, opts.workingDir);
    const outDir = path.resolve(REPO_ROOT, opts.outDir);
    const safeDir = path.resolve(REPO_ROOT, opts.safeDir);
    const legacyDir = opts.legacyDir ? path.resolve(REPO_ROOT, opts.legacyDir) : null;

    // Build card_label → filename map from working organisms (uses working total for padding)
    const workingTotal = workingOrganisms.length;
    const labelToWorkingFile = new Map();
    const sciNameToWorkingFile = new Map();
    workingOrganisms.forEach((org, index) => {
      const label = (org.card_label || `Card ${index + 1}`).trim().toLowerCase();
      const sciName = (org.scientific_name || '').trim().toLowerCase();
      const fileName = `${getOrderedCardBaseName(org.card_label || `Card ${index + 1}`, index, workingTotal)}.png`;
      labelToWorkingFile.set(label, fileName);
      if (sciName) sciNameToWorkingFile.set(sciName, fileName);
    });

    ensureDir(outDir);
    ensureDir(safeDir);
    if (legacyDir) ensureDir(legacyDir);

    const expectedFiles = new Set();
    const missing = [];

    for (const org of symbioticPowerhouses) {
      const label = (org.card_label || '').trim().toLowerCase();
      const sciName = (org.scientific_name || '').trim().toLowerCase();
      let workingFile = labelToWorkingFile.get(label);
      
      // Fallback to scientific name lookup if card_label not found
      if (!workingFile && sciName) {
        workingFile = sciNameToWorkingFile.get(sciName);
      }
      
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
      console.warn(`⚠ Could not copy ${missing.length} Symbiotic Powerhouse card(s) — run generate:organisms:working first:`);
      for (const m of missing) console.warn(`  - ${m}`);
    }

    console.log(`✅ Copied ${expectedFiles.size}/${symbioticPowerhouses.length} Symbiotic Powerhouse organism cards`);
    console.log(`✓ Mirrored to ${safeDir}`);
    if (legacyDir) console.log(`✓ Mirrored to ${legacyDir}`);
  } catch (err) {
    console.error('Failed to copy Symbiotic Powerhouse cards:', err.message);
    process.exit(1);
  }
})();

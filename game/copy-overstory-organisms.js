#!/usr/bin/env node
/**
 * Copies overstory plants organism card PNGs from the working organisms output folder
 * instead of re-rendering them. The working organisms must be generated first.
 */

const fs = require('fs');
const path = require('path');

const { ensureDir } = require('./lib/file');

const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs() {
  const opts = {
    workingConfig: 'game/config/organisms.json',
    categoryConfig: 'game/config/organisms.overstory.plants.json',
    workingDir: 'Output/working organisms',
    outDir: 'Output/Overstory Plants',
    safeDir: 'saved_files/Working Organism Cards/Overstory Plants',
    legacyDir: 'Output/Overstory Plants',
  };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--workingConfig' && args[i + 1]) opts.workingConfig = args[++i];
    else if (a === '--categoryConfig' && args[i + 1]) opts.categoryConfig = args[++i];
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
  const cardNum = getCardNumberFromLabel(cardLabel);
  if (Number.isFinite(cardNum)) {
    return String(cardNum).padStart(digits, '0');
  }
  return String(fallbackIndex).padStart(digits, '0');
}

function main() {
  const opts = parseArgs();

  // Ensure output directories exist
  ensureDir(path.resolve(REPO_ROOT, opts.outDir));
  ensureDir(path.resolve(REPO_ROOT, opts.safeDir));
  ensureDir(path.resolve(REPO_ROOT, opts.legacyDir));

  // Load organisms
  const workingOrgs = loadOrganisms(opts.workingConfig);
  const categoryOrgs = loadOrganisms(opts.categoryConfig);

  // Build a lookup by scientific name
  const workingLookup = {};
  workingOrgs.forEach((org, idx) => {
    if (org.scientific_name) {
      workingLookup[org.scientific_name] = { org, idx };
    }
  });

  const totalCategoryOrgs = categoryOrgs.length;
  let copiedCount = 0;
  let missingCount = 0;

  categoryOrgs.forEach((categoryOrg, categoryIdx) => {
    const sciName = categoryOrg.scientific_name;
    if (!workingLookup[sciName]) {
      console.warn(
        `⚠️  Organism "${categoryOrg.common_name}" (${sciName}) not found in working organisms.`
      );
      missingCount++;
      return;
    }

    const { org: workingOrg, idx: workingIdx } = workingLookup[sciName];
    // Get the working card filename using the same logic as generate-organism-working-cards.js
    const workingCardBaseName = getOrderedCardBaseName(workingOrg.card_label, workingIdx, workingOrgs.length);
    const pngName = `card-${workingCardBaseName}.png`;
    const srcPath = path.resolve(REPO_ROOT, opts.workingDir, pngName);
    
    // Determine output filenames
    const outBaseName = getOrderedCardBaseName(categoryOrg.card_label, categoryIdx, totalCategoryOrgs);
    const outPngName = `${outBaseName}.png`;
    const outPath = path.resolve(REPO_ROOT, opts.outDir, outPngName);
    const safePath = path.resolve(REPO_ROOT, opts.safeDir, outPngName);
    const legacyPath = path.resolve(REPO_ROOT, opts.legacyDir, outPngName);

    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠️  PNG not found: ${srcPath}`);
      missingCount++;
      return;
    }

    // Copy to output directories
    fs.copyFileSync(srcPath, outPath);
    fs.copyFileSync(srcPath, safePath);
    fs.copyFileSync(srcPath, legacyPath);

    copiedCount++;
  });

  console.log(`✅ Copied ${copiedCount}/${totalCategoryOrgs} overstory plants organism cards`);
  if (missingCount > 0) {
    console.warn(`⚠️  ${missingCount} organisms or PNGs were missing`);
  }
}

main();

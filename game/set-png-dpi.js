#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { setPngFileDensity } = require('./lib/png-density');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    dir: 'game/lib/cards/layers/main-photo',
    dpi: 300,
    recursive: false,
  };

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--dir' && args[index + 1]) {
      opts.dir = args[++index];
    } else if (arg === '--dpi' && args[index + 1]) {
      const parsed = Number(args[++index]);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error('--dpi must be a positive number');
      }
      opts.dpi = parsed;
    } else if (arg === '--recursive') {
      opts.recursive = true;
    }
  }

  return opts;
}

function collectPngFiles(dirPath, recursive) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (recursive) {
        files.push(...collectPngFiles(entryPath, true));
      }
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      files.push(entryPath);
    }
  }

  return files;
}

function main() {
  const opts = parseArgs();
  const targetDir = path.resolve(process.cwd(), opts.dir);

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const files = collectPngFiles(targetDir, opts.recursive);
  for (const filePath of files) {
    setPngFileDensity(filePath, opts.dpi);
  }

  console.log(`Updated ${files.length} PNG files in ${targetDir} to ${opts.dpi} DPI metadata.`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
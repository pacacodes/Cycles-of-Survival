#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { ensureDirForFile, autoOpen } = require('./lib/file');
const { renderBoardPNG } = require('./lib/board/layout');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { config: 'game/config/board.json', out: 'output/Board/board.png', noOpen: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--config' && args[i + 1]) opts.config = args[++i];
    else if (a === '--out' && args[i + 1]) opts.out = args[++i];
    else if (a === '--noOpen') opts.noOpen = true;
  }
  return opts;
}

function loadBoard(configPath) {
  const abs = path.resolve(process.cwd(), configPath);
  const raw = fs.readFileSync(abs, 'utf8');
  const data = JSON.parse(raw);
  return data;
}

(async function main() {
  try {
    const opts = parseArgs();
    const cfg = loadBoard(opts.config);
    const outPath = path.resolve(process.cwd(), opts.out);
    ensureDirForFile(outPath);

    await renderBoardPNG(cfg, outPath);
    console.log(`Wrote board PNG to ${outPath}`);
    if (!opts.noOpen) autoOpen(outPath);
  } catch (err) {
    console.error('Failed to generate board:', err.message);
    process.exit(1);
  }
})();

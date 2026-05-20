#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    sources: ['Output', 'saved_files'],
    outDir: 'Output/all-pngs',
    noIndex: false,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--sources' && args[i + 1]) {
      opts.sources = args[++i]
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    } else if (a === '--outDir' && args[i + 1]) {
      opts.outDir = args[++i];
    } else if (a === '--noIndex') {
      opts.noIndex = true;
    }
  }

  return opts;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function walkFiles(dirPath, fileList = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function isPng(filePath) {
  return filePath.toLowerCase().endsWith('.png');
}

function htmlEscape(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function writeGalleryHtml(outDirAbs, items) {
  const cards = items.map((item) => {
    const rel = item.relativeOutputPath.replace(/\\/g, '/');
    const src = encodeURI(rel);
    return `\n      <article class="card">\n        <a href="${src}" target="_blank" rel="noopener noreferrer">\n          <img loading="lazy" src="${src}" alt="${htmlEscape(rel)}" />\n        </a>\n        <div class="meta">${htmlEscape(rel)}</div>\n      </article>`;
  }).join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>All Synced PNGs</title>
  <style>
    body { font-family: Helvetica, Arial, sans-serif; margin: 0; background: #f5f7fa; color: #111827; }
    header { position: sticky; top: 0; z-index: 2; background: #0f172a; color: #fff; padding: 12px 16px; }
    .count { opacity: 0.8; font-size: 14px; }
    main { padding: 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .card img { width: 100%; height: 220px; object-fit: contain; background: #f8fafc; display: block; }
    .meta { font-size: 12px; padding: 8px; word-break: break-word; }
  </style>
</head>
<body>
  <header>
    <div><strong>Cycles of Survival - Synced PNG Gallery</strong></div>
    <div class="count">${items.length} PNG files</div>
  </header>
  <main>
    <section class="grid">${cards}
    </section>
  </main>
</body>
</html>
`;

  fs.writeFileSync(path.join(outDirAbs, 'index.html'), html, 'utf8');
}

function main() {
  const opts = parseArgs();
  const outDirAbs = path.resolve(REPO_ROOT, opts.outDir);

  removeDir(outDirAbs);
  ensureDir(outDirAbs);

  const copied = [];

  for (const source of opts.sources) {
    const sourceAbs = path.resolve(REPO_ROOT, source);
    if (!fs.existsSync(sourceAbs)) {
      console.log(`- Skipping missing source: ${source}`);
      continue;
    }

    const files = walkFiles(sourceAbs).filter(isPng);
    for (const srcPath of files) {
      const relFromSource = path.relative(sourceAbs, srcPath);
      const targetPath = path.join(outDirAbs, source, relFromSource);
      ensureDir(path.dirname(targetPath));
      fs.copyFileSync(srcPath, targetPath);
      copied.push({
        source,
        sourcePath: srcPath,
        targetPath,
        relativeOutputPath: path.relative(outDirAbs, targetPath),
      });
    }

    console.log(`- ${source}: ${files.length} PNG file(s)`);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    total: copied.length,
    outDir: opts.outDir,
    sources: opts.sources,
    files: copied.map((item) => ({
      source: item.source,
      sourcePath: path.relative(REPO_ROOT, item.sourcePath).replace(/\\/g, '/'),
      outputPath: path.relative(REPO_ROOT, item.targetPath).replace(/\\/g, '/'),
    })),
  };

  fs.writeFileSync(path.join(outDirAbs, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  if (!opts.noIndex) {
    writeGalleryHtml(outDirAbs, copied);
  }

  console.log(`✓ Synced ${copied.length} PNG file(s) into ${opts.outDir}`);
  if (!opts.noIndex) {
    console.log(`✓ Gallery: ${path.join(opts.outDir, 'index.html')}`);
  }
}

main();

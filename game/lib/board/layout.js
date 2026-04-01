const fs = require('fs');
const path = require('path');
const { createCanvasInches, writeCanvasPNG, compositePNG } = require('../png');
const { INCH } = require('../size');
const drawBackground = require('./layers/background');
const drawTitle = require('./layers/title');
const drawGrid = require('./layers/grid');
const drawSpaces = require('./layers/spaces');

function renderBoardPNG(cfg, outPath, options = {}) {
  const dpi = options.dpi || 300;
  const widthIn = cfg.page?.widthIn || 18;
  const heightIn = cfg.page?.heightIn || 24;
  const { canvas: bgCanvas, ctx: bg, widthPx, heightPx, scale } = createCanvasInches(widthIn, heightIn, dpi);

  // Layers dir
  const outDir = path.dirname(outPath);
  const layersDir = path.join(outDir, 'layers');
  fs.mkdirSync(layersDir, { recursive: true });

  // Background layer
  drawBackground(bg, cfg, widthPx, heightPx);
  const bgPath = path.join(layersDir, 'background.png');
  writeCanvasPNG(bgCanvas, bgPath);

  // Title layer
  const { canvas: titleCanvas, ctx: title } = createCanvasInches(widthIn, heightIn, dpi);
  drawTitle(title, cfg, widthPx, scale, INCH);
  const titlePath = path.join(layersDir, 'title.png');
  writeCanvasPNG(titleCanvas, titlePath);

  // Grid layer
  const { canvas: gridCanvas, ctx: grid } = createCanvasInches(widthIn, heightIn, dpi);
  const rows = cfg.grid?.rows || 10;
  const cols = cfg.grid?.cols || 10;
  const cellIn = cfg.grid?.cellIn || 1;
  const cellPx = cellIn * INCH * scale;
  const gridW = cols * cellPx;
  const gridH = rows * cellPx;
  const gx = (widthPx - gridW) / 2;
  const gy = (heightPx - gridH) / 2;

  drawGrid(grid, cfg, { rows, cols, gx, gy, gridW, gridH, cellPx, scale });
  const gridPath = path.join(layersDir, 'grid.png');
  writeCanvasPNG(gridCanvas, gridPath);

  // Spaces layer
  const { canvas: spacesCanvas, ctx: spaces } = createCanvasInches(widthIn, heightIn, dpi);
  drawSpaces(spaces, cfg, { gx, gy, cellPx, scale, INCH });
  const spacesPath = path.join(layersDir, 'spaces.png');
  writeCanvasPNG(spacesCanvas, spacesPath);

  // Composite final board
  const finalPath = outPath;
  compositePNG(finalPath, widthPx, heightPx, [bgPath, gridPath, spacesPath, titlePath]);
  return finalPath;
}

module.exports = {
  renderBoardPNG,
};

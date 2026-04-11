const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { setPngDensity } = require('./png-density');

// 1 inch = 72 points; scale converts points to pixels at given DPI
const INCH = 72;

function configureCanvasContext(ctx) {
  if (!ctx) return ctx;

  ctx.imageSmoothingEnabled = true;
  if ('imageSmoothingQuality' in ctx) {
    ctx.imageSmoothingQuality = 'high';
  }
  if ('patternQuality' in ctx) {
    ctx.patternQuality = 'best';
  }
  if ('quality' in ctx) {
    ctx.quality = 'best';
  }
  if ('antialias' in ctx) {
    ctx.antialias = 'subpixel';
  }
  if ('textDrawingMode' in ctx) {
    ctx.textDrawingMode = 'path';
  }

  return ctx;
}

function createCanvasInches(widthIn, heightIn, dpi = 300) {
  const widthPx = Math.round(widthIn * dpi);
  const heightPx = Math.round(heightIn * dpi);
  const canvas = createCanvas(widthPx, heightPx);
  const ctx = configureCanvasContext(canvas.getContext('2d'));
  const scale = dpi / INCH; // px per point
  return { canvas, ctx, widthPx, heightPx, scale };
}

function writeCanvasPNG(canvas, outPath, dpi = 300) {
  const buf = setPngDensity(canvas.toBuffer('image/png'), dpi);
  fs.mkdirSync(require('path').dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  return outPath;
}

async function compositePNG(outPath, widthPx, heightPx, layerPaths, dpi = 300) {
  const canvas = createCanvas(widthPx, heightPx);
  const ctx = configureCanvasContext(canvas.getContext('2d'));
  // Transparent base
  ctx.clearRect(0, 0, widthPx, heightPx);
  for (const p of layerPaths) {
    // skip missing paths silently
    try {
      const img = await loadImage(p);
      ctx.drawImage(img, 0, 0, widthPx, heightPx);
    } catch (e) {
      // ignore
    }
  }
  writeCanvasPNG(canvas, outPath, dpi);
  return outPath;
}

module.exports = {
  configureCanvasContext,
  createCanvasInches,
  writeCanvasPNG,
  compositePNG,
};

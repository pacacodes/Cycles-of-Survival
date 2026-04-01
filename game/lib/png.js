const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// 1 inch = 72 points; scale converts points to pixels at given DPI
const INCH = 72;

function createCanvasInches(widthIn, heightIn, dpi = 300) {
  const widthPx = Math.round(widthIn * dpi);
  const heightPx = Math.round(heightIn * dpi);
  const canvas = createCanvas(widthPx, heightPx);
  const ctx = canvas.getContext('2d');
  const scale = dpi / INCH; // px per point
  return { canvas, ctx, widthPx, heightPx, scale };
}

function writeCanvasPNG(canvas, outPath) {
  const buf = canvas.toBuffer('image/png');
  fs.mkdirSync(require('path').dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  return outPath;
}

async function compositePNG(outPath, widthPx, heightPx, layerPaths) {
  const canvas = createCanvas(widthPx, heightPx);
  const ctx = canvas.getContext('2d');
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
  writeCanvasPNG(canvas, outPath);
  return outPath;
}

module.exports = {
  createCanvasInches,
  writeCanvasPNG,
  compositePNG,
};

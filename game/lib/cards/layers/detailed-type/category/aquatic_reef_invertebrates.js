const path = require('path');
const { createCanvasInches, writeCanvasPNG } = require('../../../../png');
const { loadImage } = require('canvas');
const { INCH } = require('../../../../size');

const CATEGORY_NAME = 'Aquatic & Reef Invertebrates';
const LABEL = 'ARI';
const FILL = '#80DEEA';
const STROKE = '#00838F';
const TEXT = '#004D40';
const ICON_PNG = '/workspaces/ELPACA/output/Aquatic & Reef Invertebrates Icon.png';

async function drawCategoryLogo(ctx, xPt, yPt, sizePt, scale) {
  const x = xPt * scale;
  const y = yPt * scale;
  const size = sizePt * scale;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const radius = size * 0.46;
  
  ctx.save();
  
  // Draw circle background
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = FILL;
  ctx.fill();
  ctx.lineWidth = Math.max(1, 1 * scale);
  ctx.strokeStyle = STROKE;
  ctx.stroke();
  
  // Try to load and draw the icon PNG
  try {
    const img = await loadImage(ICON_PNG);
    const iconSize = size * 0.92;
    const iconX = x + (size - iconSize) / 2;
    const iconY = y + (size - iconSize) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
    ctx.restore();
  } catch (error) {
    // Fallback to text label if image not found
    ctx.fillStyle = TEXT;
    ctx.font = `${Math.round(size * 0.26)}px "DejaVu Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(LABEL, cx, cy);
  }
  
  ctx.restore();
}

async function generateCategoryLogo(outPath, options = {}) {
  const dpi = options.dpi || 300;
  const sizeIn = options.sizeIn || 1.0;
  const { canvas, ctx, scale } = createCanvasInches(sizeIn, sizeIn, dpi);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  await drawCategoryLogo(ctx, 0, 0, sizeIn * INCH, scale);
  writeCanvasPNG(canvas, outPath);
  console.log(`✓ ${CATEGORY_NAME} logo generated: ${outPath}`);
}

if (require.main === module) {
  const outPath = process.argv[2] || path.resolve(process.cwd(), 'output/Category/aquatic-reef-invertebrates.png');
  generateCategoryLogo(outPath).catch(console.error);
}

module.exports = {
  CATEGORY_NAME,
  drawCategoryLogo,
  generateCategoryLogo,
};

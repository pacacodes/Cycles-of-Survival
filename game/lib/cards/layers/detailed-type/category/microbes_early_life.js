const path = require('path');
const { createCanvasInches, writeCanvasPNG } = require('../../../../png');
const { INCH } = require('../../../../size');

const CATEGORY_NAME = 'Microbes & Early Life';
const LABEL = 'MIC';
const FILL = '#4DB6AC';
const STROKE = '#00796B';
const TEXT = '#FFFFFF';

function drawCategoryLogo(ctx, xPt, yPt, sizePt, scale) {
  const x = xPt * scale;
  const y = yPt * scale;
  const size = sizePt * scale;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const radius = size * 0.46;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = FILL;
  ctx.fill();
  ctx.lineWidth = Math.max(1, 1 * scale);
  ctx.strokeStyle = STROKE;
  ctx.stroke();
  ctx.fillStyle = TEXT;
  ctx.font = `${Math.round(size * 0.26)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(LABEL, cx, cy);
  ctx.restore();
}

function generateCategoryLogo(outPath, options = {}) {
  const dpi = options.dpi || 300;
  const sizeIn = options.sizeIn || 1.0;
  const { canvas, ctx, scale } = createCanvasInches(sizeIn, sizeIn, dpi);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCategoryLogo(ctx, 0, 0, sizeIn * INCH, scale);
  writeCanvasPNG(canvas, outPath);
  console.log(`✓ ${CATEGORY_NAME} logo generated: ${outPath}`);
}

if (require.main === module) {
  const outPath = process.argv[2] || path.resolve(process.cwd(), 'output/Category/microbes-early-life.png');
  generateCategoryLogo(outPath);
}

module.exports = {
  CATEGORY_NAME,
  drawCategoryLogo,
  generateCategoryLogo,
};

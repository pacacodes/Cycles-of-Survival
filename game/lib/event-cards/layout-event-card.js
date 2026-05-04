const { createCanvasInches, writeCanvasPNG, configureCanvasContext } = require('../png');
const { INCH, CARD_TRIM_W, CARD_TRIM_H, CARD_BLEED_W, CARD_BLEED_H, BLEED } = require('../size');
const { getEventColorScheme } = require('./color-scheme');

/**
 * Draw an event card PNG
 * @param {Object} ctx - Canvas context
 * @param {number} xPt - X position in points
 * @param {number} yPt - Y position in points
 * @param {Object} event - Prepared event object
 * @param {number} scale - Scale factor
 * @param {Object} options - Optional configuration
 */
async function drawEventCardPNG(ctx, xPt, yPt, event, scale, options = {}) {
  const includeGuides = options.includeGuides !== false;
  const colors = getEventColorScheme(event.type);

  const x = xPt * scale;
  const y = yPt * scale;
  const w = CARD_BLEED_W * scale;
  const h = CARD_BLEED_H * scale;

  ctx.save();

  // Draw bleed area (background)
  ctx.fillStyle = colors.background;
  ctx.fillRect(x, y, w, h);

  // Draw trim guides
  if (includeGuides) {
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    const trimX = x + BLEED * scale;
    const trimY = y + BLEED * scale;
    const trimW = CARD_TRIM_W * scale;
    const trimH = CARD_TRIM_H * scale;
    ctx.strokeRect(trimX, trimY, trimW, trimH);
    ctx.setLineDash([]);
  }

  // Draw content area with padding
  const padding = 12 * scale;
  const contentX = x + BLEED * scale + padding;
  const contentY = y + BLEED * scale + padding;
  const contentW = CARD_TRIM_W * scale - (padding * 2);
  const contentH = CARD_TRIM_H * scale - (padding * 2);

  // Configure text rendering
  configureCanvasContext(ctx, scale);

  // Draw title with event name and period
  ctx.fillStyle = colors.titleText;
  ctx.font = `bold ${18 * scale}px Arial`;
  ctx.textBaseline = 'top';
  
  let titleText = event.name;
  if (event.period) {
    titleText += ` (${event.period})`;
  }
  ctx.fillText(titleText, contentX, contentY);

  // Draw type indicator
  ctx.fillStyle = colors.neon;
  ctx.font = `${12 * scale}px Arial`;
  ctx.fillText(event.type.toUpperCase(), contentX, contentY + 28 * scale);

  // Draw effect text
  ctx.fillStyle = '#000000';
  ctx.font = `${11 * scale}px Arial`;
  const effectY = contentY + 50 * scale;
  wrapAndDrawText(ctx, event.effectText, contentX, effectY, contentW - padding, 14 * scale);

  // Draw biomes section
  const biomesY = effectY + 60 * scale;
  ctx.font = `bold ${12 * scale}px Arial`;
  ctx.fillStyle = colors.neon;
  ctx.fillText('Biomes Affected:', contentX, biomesY);

  ctx.font = `${10 * scale}px Arial`;
  ctx.fillStyle = '#000000';
  let currentY = biomesY + 18 * scale;
  
  if (event.biomes && event.biomes.length > 0) {
    event.biomes.forEach((biome, idx) => {
      if (idx >= 4) return; // Limit to 4 biomes display
      ctx.fillText(`${biome.indicator} ${biome.name}`, contentX + 10 * scale, currentY);
      currentY += 12 * scale;
    });
  }

  // Draw organisms section
  const organismsY = currentY + 10 * scale;
  ctx.font = `bold ${12 * scale}px Arial`;
  ctx.fillStyle = colors.neon;
  ctx.fillText('Organisms Affected:', contentX, organismsY);

  ctx.font = `${9 * scale}px Arial`;
  ctx.fillStyle = '#000000';
  currentY = organismsY + 18 * scale;
  
  if (event.organisms && event.organisms.length > 0) {
    event.organisms.forEach((org, idx) => {
      if (idx >= 4) return; // Limit to 4 organisms display
      const label = org.example ? `${org.indicator} ${org.group} (${org.example})` : `${org.indicator} ${org.group}`;
      ctx.fillText(label, contentX + 10 * scale, currentY);
      currentY += 10 * scale;
    });
  }

  // Draw impact stats at bottom
  const statsY = contentY + contentH - 25 * scale;
  ctx.font = `${10 * scale}px Arial`;
  ctx.fillStyle = '#666666';
  const co2Str = `CO₂: ${event.co2Change > 0 ? '+' : ''}${event.co2Change}`;
  const o2Str = `O₂: ${event.o2Change > 0 ? '+' : ''}${event.o2Change}`;
  const bioStr = `Bio: ${event.biodiversityChange > 0 ? '+' : ''}${event.biodiversityChange}`;
  
  ctx.fillText(`${co2Str}  ${o2Str}  ${bioStr}`, contentX, statsY);

  ctx.restore();
}

/**
 * Wrap and draw multi-line text
 * @param {Object} ctx - Canvas context
 * @param {string} text - Text to draw
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} maxWidth - Maximum width for wrapping
 * @param {number} lineHeight - Height of each line
 */
function wrapAndDrawText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return;
  
  const words = text.split(' ');
  let line = '';
  let lineY = y;

  words.forEach(word => {
    const testLine = line + (line ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  });
  
  if (line) {
    ctx.fillText(line, x, lineY);
  }
}

/**
 * Create a single event card PNG
 * @param {string} outputPath - Path to save PNG
 * @param {Object} event - Prepared event object
 * @param {Object} options - Options (dpi, etc)
 */
async function writeSingleEventCardPNG(outputPath, event, options = {}) {
  const dpi = options.dpi || 300;
  const scale = dpi / 72;

  const canvas = createCanvasInches(CARD_BLEED_W, CARD_BLEED_H, dpi);
  const ctx = canvas.getContext('2d');

  await drawEventCardPNG(ctx, 0, 0, event, scale);
  await writeCanvasPNG(canvas, outputPath);
}

module.exports = {
  drawEventCardPNG,
  writeSingleEventCardPNG,
  wrapAndDrawText,
};

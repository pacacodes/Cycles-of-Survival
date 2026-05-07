const { CATEGORY_COLORS } = require('../../title-color-block');

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  return `rgba(${parseInt(hex.slice(0,2),16)},${parseInt(hex.slice(2,4),16)},${parseInt(hex.slice(4,6),16)},${alpha})`;
}

function getCardColor(card) {
  // For organism cards: use neonColor if set (matches title color block), else lookup from organism_type
  if (card.neonColor) {
    return card.neonColor;
  }
  return CATEGORY_COLORS[card.organism_type] || '#CCCCCC';
}

// Title-case words, replace underscores, replace "And" with "&"
function formatValue(raw) {
  return (raw || '')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b([a-z])/g, c => c.toUpperCase())
    .replace(/\bAnd\b/g, '&');
}

// Split "Main text (sub text)" into { main, sub }
function parseField(raw) {
  const str = String(raw || '').replace(/_/g, ' ').trim();
  const m = str.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (m) return { main: formatValue(m[1].trim()), sub: formatValue(m[2].trim()) };
  return { main: formatValue(str), sub: null };
}

// Compute the right edge X of the background box drawn by draw-field-row.js
function computeBackgroundRightX(ctx, { label, main, sub, textX, scale, maxWidth }) {
  const fieldSize = Math.round(4.5 * scale);
  const subSize   = Math.round(4.5 * scale);
  const boxPadX   = 4 * scale;
  // Mirror normalizations from draw-field-row.js
  const displayLabel = label.toUpperCase();
  const displaySub = sub ? sub.toLowerCase().replace(/\bma\b/g, 'Ma').replace(/\bga\b/g, 'Ga') : null;
  ctx.save();
  ctx.font = `bold ${fieldSize}px "DejaVu Sans", sans-serif`;
  const labelPart = `${displayLabel} : `;
  const labelPartW = ctx.measureText(labelPart).width;
  const mainW = ctx.measureText(main).width;
  let subW = 0;
  if (displaySub) {
    ctx.font = `${subSize}px "DejaVu Sans", sans-serif`;
    subW = ctx.measureText(displaySub).width;
  }
  ctx.restore();
  const contentW = maxWidth
    ? Math.min(Math.max(labelPartW + mainW, subW), maxWidth)
    : Math.max(labelPartW + mainW, subW);
  return textX + contentW + boxPadX;
}

module.exports = { hexToRgba, getCardColor, formatValue, parseField, computeBackgroundRightX };

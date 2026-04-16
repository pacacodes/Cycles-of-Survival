const { CATEGORY_COLORS } = require('../../title-color-block');

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  return `rgba(${parseInt(hex.slice(0,2),16)},${parseInt(hex.slice(2,4),16)},${parseInt(hex.slice(4,6),16)},${alpha})`;
}

function getCardColor(card) {
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

module.exports = { hexToRgba, getCardColor, formatValue, parseField };

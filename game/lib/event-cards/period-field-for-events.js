/**
 * Period field handler for event cards
 * Mirrors the period field structure from organism cards
 */

// Geological period time ranges (start Ma = million years ago, end Ma; Ga = billion)
// Format: [startMa, endMa, label] — all display start to Present for clarity
const PERIOD_RANGES = {
  'Early Archean':     [4000,  3200, 'apply the effects to all organisms from the early archean period or later'],
  'Late Archean':      [3200,  2500, 'apply the effects to all organisms from the late archean period or later'],
  'Early Proterozoic': [2500,  1600, 'apply the effects to all organisms from the early proterozoic period or later'],
  'Late Proterozoic':  [1000,   635, 'apply the effects to all organisms from the late proterozoic period or later'],
  'Ediacaran':         [ 635,   539, 'apply the effects to all organisms from the ediacaran period or later'],
  'Cambrian':          [ 539,   485, 'apply the effects to all organisms from the cambrian period or later'],
  'Ordovician':        [ 485,   444, 'apply the effects to all organisms from the ordovician period or later'],
  'Silurian':          [ 444,   419, 'apply the effects to all organisms from the silurian period or later'],
  'Devonian':          [ 419,   359, 'apply the effects to all organisms from the devonian period or later'],
  'Carboniferous':     [ 359,   299, 'apply the effects to all organisms from the carboniferous period or later'],
  'Permian':           [ 299,   252, 'apply the effects to all organisms from the permian period or later'],
  'Triassic':          [ 252,   201, 'apply the effects to all organisms from the triassic period or later'],
  'Jurassic':          [ 201,   145, 'apply the effects to all organisms from the jurassic period or later'],
  'Cretaceous':        [ 145,    66, 'apply the effects to all organisms from the cretaceous period or later'],
  'Paleogene':         [  66,    23, 'apply the effects to all organisms from the paleogene period or later'],
  'Neogene':           [  23,   2.6, 'apply the effects to all organisms from the neogene period or later'],
  'Quaternary':        [ 2.6,     0, 'apply the effects to all organisms from the quaternary period'],
};

function formatValue(value) {
  if (!value) return '';
  return String(value)
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function periodTimeSpan(periods) {
  if (!periods || !periods.length) return null;
  const matched = periods.map(p => PERIOD_RANGES[p]).filter(Boolean);
  if (!matched.length) return null;
  if (matched.length === 1) return matched[0][2];
  // Multiple periods: show span from oldest start to newest end
  const oldest  = Math.max(...matched.map(r => r[0]));
  const newest  = Math.min(...matched.map(r => r[1]));
  const oldestEntry = matched.find(r => r[0] === oldest);
  const newestEntry = matched.find(r => r[1] === newest);
  const startLabel = oldestEntry[2].split('–')[0].trim();
  const endLabel   = newestEntry[2].split('–')[1].trim();
  return `${startLabel} – ${endLabel}`;
}

/**
 * Create a period field definition for event cards
 * Uses the same background styling as organism cards
 * @param {Array} periods - Array of period names
 * @returns {Object|null} - Field definition or null if no periods
 */
function getPeriodField(periods) {
  if (!periods || !periods.length) return null;

  return {
    label: 'Periods',
    main: periods.map(p => formatValue(p)).join(' · '),
    sub: periodTimeSpan(periods),
    drawTop: require('../cards/layers/detailed-type/category/periods-background-top'),
    drawBottom: require('../cards/layers/detailed-type/category/periods-background-bottom'),
  };
}

module.exports = {
  getPeriodField,
  periodTimeSpan,
  formatValue,
  PERIOD_RANGES,
};

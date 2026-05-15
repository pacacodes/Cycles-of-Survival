/**
 * Period field handler for event cards
 * Mirrors the period field structure from organism cards
 */

// Geological period time ranges (start Ma = million years ago, end Ma; Ga = billion)
// Format: [startMa, endMa, label] — end=0 means "Present"
const PERIOD_RANGES = {
  'Early Archean':     [4000,  3200, '~4.0 – 3.2 Ga'],
  'Late Archean':      [3200,  2500, '~3.2 – 2.5 Ga'],
  'Early Proterozoic': [2500,  1600, '~2.5 – 1.6 Ga'],
  'Late Proterozoic':  [1000,   635, '~1.0 Ga – 635 Ma'],
  'Ediacaran':         [ 635,   539, '635 – 539 Ma'],
  'Cambrian':          [ 539,   485, '539 – 485 Ma'],
  'Ordovician':        [ 485,   444, '485 – 444 Ma'],
  'Silurian':          [ 444,   419, '444 – 419 Ma'],
  'Devonian':          [ 419,   359, '419 – 359 Ma'],
  'Carboniferous':     [ 359,   299, '359 – 299 Ma'],
  'Permian':           [ 299,   252, '299 – 252 Ma'],
  'Triassic':          [ 252,   201, '252 – 201 Ma'],
  'Jurassic':          [ 201,   145, '201 – 145 Ma'],
  'Cretaceous':        [ 145,    66, '145 – 66 Ma'],
  'Paleogene':         [  66,    23, '66 – 23 Ma'],
  'Neogene':           [  23,   2.6, '23 – 2.6 Ma'],
  'Quaternary':        [ 2.6,     0, '2.6 Ma – Present'],
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
    main: periods.map(p => formatValue(p)).join(', '),
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

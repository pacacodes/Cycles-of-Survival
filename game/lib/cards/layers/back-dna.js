const { BLEED, CARD_TRIM_W, CARD_TRIM_H } = require('../../size');

const DNA_GRID_COLUMNS = 45;
const DNA_GRID_ROWS = 63;
const DNA_GRID_TOTAL = DNA_GRID_COLUMNS * DNA_GRID_ROWS;
const DNA_PAD_SOURCE_TARGET = 4000;
const BASE_COLORS = {
  A: '#EB5C3F',
  C: '#EBB142',
  T: '#57EBB9',
  G: '#76EB73',
  N: '#EB342C',
};

function getFilledGridSize(visibleCount) {
  const count = Math.max(0, visibleCount);
  if (count <= 0) return null;

  // Keep a true square-cell grid by enforcing the card trim ratio (5:7).
  // cols = 5n, rows = 7n, cells = 35n^2
  const maxNByCols = Math.floor(DNA_GRID_COLUMNS / 5);
  const maxNByRows = Math.floor(DNA_GRID_ROWS / 7);
  const maxNByBounds = Math.min(maxNByCols, maxNByRows);
  let bestN = 0;

  for (let n = 1; n <= maxNByBounds; n++) {
    const cells = 35 * n * n;
    if (cells <= count) {
      bestN = n;
    }
  }

  if (bestN === 0) {
    return { cols: 1, rows: 1, cells: 1 };
  }

  return {
    cols: 5 * bestN,
    rows: 7 * bestN,
    cells: 35 * bestN * bestN,
  };
}

function isExtinctAnimal(card) {
  const category = String((card && card.organism_type) || '').toLowerCase();
  const periods = Array.isArray(card && card.periods)
    ? card.periods.map((p) => String(p).toLowerCase())
    : [];
  const eras = Array.isArray(card && card.eras)
    ? card.eras.map((e) => String(e).toLowerCase())
    : [];

  const animalCategory = /vertebrates|invertebrates|dinosaurs|birds|mammals/.test(category);
  const ancientEra = eras.some((era) => era !== 'cenozoic');
  const modernPeriods = new Set(['quaternary', 'holocene', 'pleistocene']);
  const ancientPeriod = periods.some((period) => !modernPeriods.has(period));

  return animalCategory && (ancientEra || ancientPeriod);
}

function getDnaDisplaySequence(dna, card) {
  if (!dna.length) return '';

  if (!isExtinctAnimal(card)) {
    // For non-extinct cards, suppress N bases entirely and render only A/T/G/C.
    return dna.replace(/N/g, '').slice(0, DNA_GRID_TOTAL);
  }

  const isAllN = /^[N]+$/.test(dna);
  const hasSyntheticPadding = dna.length < DNA_PAD_SOURCE_TARGET && !isAllN;

  if (hasSyntheticPadding) {
    return dna.replace(/N+$/g, '').slice(0, DNA_GRID_TOTAL);
  }

  return dna.slice(0, DNA_GRID_TOTAL).padEnd(DNA_GRID_TOTAL, 'N');
}

function normalizeDna(sequence) {
  // Keep nucleotide letters only and preserve source order without synthetic padding.
  const lettersOnly = String(sequence || '')
    .toUpperCase()
    .replace(/[^ACGTN]/g, '');
  return lettersOnly;
}

module.exports = async function drawBackDnaLayer(ctx, x, y, scale, card) {
  const safeInset = BLEED * scale;

  const dna = normalizeDna(card && card.dna_sequence);
  const drawX = x + safeInset;
  const drawY = y + safeInset;
  const drawW = Math.max(1, CARD_TRIM_W * scale);
  const drawH = Math.max(1, CARD_TRIM_H * scale);

  ctx.save();

  if (!dna.length || /^N+$/.test(dna)) {
    ctx.restore();
    return;
  }

  const dnaForDisplay = getDnaDisplaySequence(dna, card);
  if (dnaForDisplay.length < 400) {
    ctx.restore();
    return;
  }
  const grid = getFilledGridSize(dnaForDisplay.length);
  if (!grid || !grid.cells) {
    ctx.restore();
    return;
  }
  const visibleSequence = dnaForDisplay.slice(0, grid.cells);
  const cellW = drawW / grid.cols;
  const cellH = drawH / grid.rows;
  const fontSize = Math.max(1, Math.floor(Math.min(cellW, cellH) * 0.9));

  ctx.font = `${fontSize}px "DejaVu Sans Mono", "DejaVu Sans", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const index = (row * grid.cols) + col;
      const base = visibleSequence[index];
      const cx = drawX + (col * cellW) + (cellW / 2);
      const cy = drawY + (row * cellH) + (cellH / 2);

      ctx.fillStyle = BASE_COLORS[base] || BASE_COLORS.N;
      ctx.fillText(base, cx, cy);
    }
  }

  ctx.restore();
};

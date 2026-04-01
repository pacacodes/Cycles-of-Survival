// Size and layout constants (points). 1 inch = 72 points
const INCH = 72;
const CARD_TRIM_W = 2.5 * INCH; // 180 pt
const CARD_TRIM_H = 3.5 * INCH; // 252 pt
const BLEED = 0.125 * INCH; // 9 pt
const CARD_BLEED_W = CARD_TRIM_W + 2 * BLEED; // 198 pt
const CARD_BLEED_H = CARD_TRIM_H + 2 * BLEED; // 270 pt

// Sheet layout for US Letter: 3 columns x 2 rows fits with bleed
const PAGE_SIZE = 'LETTER';
const PAGE_W = 8.5 * INCH; // 612 pt
const PAGE_H = 11 * INCH;  // 792 pt
const COLS = 3;
const ROWS = 2;
const GAP_X = 0.125 * INCH; // spacing between cards
const GAP_Y = 0.125 * INCH;

module.exports = {
  INCH,
  CARD_TRIM_W,
  CARD_TRIM_H,
  BLEED,
  CARD_BLEED_W,
  CARD_BLEED_H,
  PAGE_SIZE,
  PAGE_W,
  PAGE_H,
  COLS,
  ROWS,
  GAP_X,
  GAP_Y,
};

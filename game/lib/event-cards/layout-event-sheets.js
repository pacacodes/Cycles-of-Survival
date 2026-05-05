const { createCanvasInches, writeCanvasPNG } = require('../png');
const { drawEventCardPNG } = require('./layout-event-card');
const { CARD_BLEED_W, CARD_BLEED_H, INCH } = require('../size');

/**
 * Layout event cards on a single sheet or multiple sheets
 * 3 columns x 2 rows per US Letter page
 */
const SHEET_COLS = 3;
const SHEET_ROWS = 2;

/**
 * Determine how many sheets are needed
 * @param {number} cardCount - Total number of cards
 * @returns {number} Number of sheets needed
 */
function getSheetCount(cardCount) {
  const cardsPerSheet = SHEET_COLS * SHEET_ROWS;
  return Math.ceil(cardCount / cardsPerSheet);
}

/**
 * Calculate position of card on sheet
 * @param {number} cardIndex - Index of card
 * @returns {Object} Object with sheet, col, row
 */
function getCardPosition(cardIndex) {
  const cardsPerSheet = SHEET_COLS * SHEET_ROWS;
  const sheet = Math.floor(cardIndex / cardsPerSheet);
  const posOnSheet = cardIndex % cardsPerSheet;
  const row = Math.floor(posOnSheet / SHEET_COLS);
  const col = posOnSheet % SHEET_COLS;

  return { sheet, row, col };
}

/**
 * Get canvas dimensions for sheet
 * 8.5" x 11" US Letter with 3x2 layout
 * @returns {Object} Width and height in inches
 */
function getSheetDimensions() {
  const cardWidthInches = CARD_BLEED_W / INCH;
  const cardHeightInches = CARD_BLEED_H / INCH;
  return {
    width: cardWidthInches * SHEET_COLS,
    height: cardHeightInches * SHEET_ROWS,
  };
}

/**
 * Draw multiple event cards on a sheet
 * @param {Object} ctx - Canvas context
 * @param {Array} events - Array of prepared event objects
 * @param {number} sheetIndex - Which sheet (0-based)
 * @param {number} scale - Scale factor
 */
async function drawEventSheetPNG(ctx, events, sheetIndex, scale) {
  const cardsPerSheet = SHEET_COLS * SHEET_ROWS;
  const startIndex = sheetIndex * cardsPerSheet;
  const endIndex = Math.min(startIndex + cardsPerSheet, events.length);

  for (let i = startIndex; i < endIndex; i++) {
    const event = events[i];
    const position = getCardPosition(i);
    
    const cardWidthPoints = CARD_BLEED_W;
    const cardHeightPoints = CARD_BLEED_H;
    const xPt = position.col * cardWidthPoints;
    const yPt = position.row * cardHeightPoints;
    
    await drawEventCardPNG(ctx, xPt, yPt, event, scale);
  }
}

/**
 * Write event cards to sheets
 * @param {string} outputPath - Path to save sheet (will append -sheet-0, -sheet-1, etc)
 * @param {Array} events - Array of prepared event objects
 * @param {Object} options - Options (dpi, etc)
 */
async function writeEventSheetsPNG(outputPath, events, options = {}) {
  const dpi = options.dpi || 300;
  const scale = dpi / 72;
  const sheetCount = getSheetCount(events.length);
  const { width, height } = getSheetDimensions();

  for (let sheetIdx = 0; sheetIdx < sheetCount; sheetIdx++) {
    const { canvas, ctx } = createCanvasInches(width, height, dpi);

    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await drawEventSheetPNG(ctx, events, sheetIdx, scale);

    const baseName = outputPath.replace(/\.[^.]+$/, '');
    const ext = outputPath.slice(outputPath.lastIndexOf('.'));
    const sheetPath = `${baseName}-sheet-${sheetIdx}${ext}`;

    await writeCanvasPNG(canvas, sheetPath);
  }
}

module.exports = {
  SHEET_COLS,
  SHEET_ROWS,
  getSheetCount,
  getCardPosition,
  getSheetDimensions,
  drawEventSheetPNG,
  writeEventSheetsPNG,
};

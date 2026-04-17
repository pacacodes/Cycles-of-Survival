/**
 * Sheet and single-page layout composers.
 * drawCardPNG is lazy-required from layout-png to avoid circular-require issues.
 */

const { configureCanvasContext, createCanvasInches, writeCanvasPNG } = require('../png');
const { INCH, CARD_BLEED_W, CARD_BLEED_H, PAGE_W, PAGE_H, COLS, ROWS, GAP_X, GAP_Y } = require('../size');
const { drawCardGuides } = require('./helpers/guides');

function layoutSheetPNG(cards, options = {}) {
  const dpi = options.dpi || 300;
  const includeGuides = options.includeGuides !== false;
  const { canvas, ctx, widthPx, heightPx, scale } = createCanvasInches(PAGE_W / INCH, PAGE_H / INCH, dpi);

  return {
    write: async (outPath) => {
      const { drawCardPNG } = require('./layout-png');

      const gridWpt = COLS * CARD_BLEED_W + (COLS - 1) * GAP_X;
      const gridHpt = ROWS * CARD_BLEED_H + (ROWS - 1) * GAP_Y;
      const startXpt = Math.max((PAGE_W - gridWpt) / 2, 0.5 * INCH);
      const startYpt = Math.max((PAGE_H - gridHpt) / 2, 0.5 * INCH);

      let idx = 0;
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, widthPx, heightPx);
      ctx.restore();

      for (let r = 0; r < ROWS && idx < cards.length; r++) {
        for (let c = 0; c < COLS && idx < cards.length; c++) {
          const xPt = startXpt + c * (CARD_BLEED_W + GAP_X);
          const yPt = startYpt + r * (CARD_BLEED_H + GAP_Y);
          await drawCardPNG(ctx, xPt, yPt, cards[idx], scale, { includeGuides: false });
          if (includeGuides) {
            drawCardGuides(ctx, xPt, yPt, scale);
          }
          idx++;
        }
      }

      writeCanvasPNG(canvas, outPath, dpi);
    },
  };
}

function layoutSinglePagesPNG(cards, options = {}) {
  const dpi = options.dpi || 300;
  const includeGuides = options.includeGuides !== false;

  return {
    write: async (outPath) => {
      const { drawCardPNG } = require('./layout-png');
      const { createCanvas } = require('@napi-rs/canvas');

      const rows = cards.length;
      const dims = createCanvasInches(CARD_BLEED_W / INCH, CARD_BLEED_H / INCH, dpi);
      const cardW = dims.widthPx;
      const cardH = dims.heightPx;
      const scale = dims.scale;

      const composite = createCanvas(cardW, cardH * rows);
      const cctx = configureCanvasContext(composite.getContext('2d'));
      cctx.fillStyle = '#FFFFFF';
      cctx.fillRect(0, 0, cardW, cardH * rows);

      for (let i = 0; i < rows; i++) {
        const rowCanvas = createCanvas(cardW, cardH);
        const rowCtx = configureCanvasContext(rowCanvas.getContext('2d'));
        await drawCardPNG(rowCtx, 0, 0, cards[i], scale, { includeGuides: false });
        if (includeGuides) {
          drawCardGuides(rowCtx, 0, 0, scale);
        }
        cctx.drawImage(rowCanvas, 0, i * cardH);
      }

      writeCanvasPNG(composite, outPath, dpi);
    },
  };
}

module.exports = { layoutSheetPNG, layoutSinglePagesPNG };

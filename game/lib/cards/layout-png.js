const { createCanvasInches, writeCanvasPNG, configureCanvasContext } = require('../png');
const { INCH, CARD_TRIM_W, CARD_TRIM_H, CARD_BLEED_W, CARD_BLEED_H, BLEED } = require('../size');
const roundedRectPath = require('./utils/path');
const wrapText = require('./utils/text');
const drawBackground = require('./layers/backgrounds/background');
const drawTrim = require('./layers/trim');
const drawTitle = require('./layers/title');
const drawBody = require('./layers/body');
const drawCorners = require('./layers/corners');
const drawCardNumber = require('./layers/card-number');
const drawFunctionalCategory = require('./layers/detailed-type/category/functional-category');
const { drawTitleColorBlock, CATEGORY_COLORS } = require('./layers/title-color-block');
const getFieldDefinitions = require('./layers/detailed-type/category/field-definitions');
const { getMainPhotoPlacement } = require('./layers/main-photo-placement');
const { buildBadgeList } = require('./helpers/badge-list');
const { drawBadgesAndConnectors } = require('./helpers/draw-badge-connectors');
const { layoutSheetPNG, layoutSinglePagesPNG } = require('./layout-sheet');
const { getEachCardBaseName, writeSingleCardPNG, writeEachCardPNG } = require('./layout-each');

function getBadgeGeometry(scale = 1) {
  const badgeRadius = 0.18 * 72 * scale;
  const badgeTextGap = 10 * scale;
  const leftPadding = Math.round(16 * scale);
  const margin = 0.15 * 72 * scale;
  const BLEED_PT = 0.125 * 72 * scale;
  const safeX = BLEED_PT;
  const contentX = safeX + margin;
  const badgeStartX = contentX + leftPadding - 10 * scale;
  return { badgeRadius, badgeTextGap, leftPadding, badgeStartX };
}

async function drawCardPNG(ctx, xPt, yPt, card, scale, options = {}) {
  const includeGuides = options.includeGuides !== false;
  const { badgeRadius, badgeTextGap, leftPadding, badgeStartX } = getBadgeGeometry(scale);
  const condensedRowH = Math.round((badgeRadius * 2) + (6 * scale)) * 0.60;
  const bottomPadding = Math.round(6 * scale);
  const blockFieldCount = [
    card.organism_type ? 1 : 0,
    card.biomes && card.biomes.length ? 1 : 0,
    card.trophic_level ? 1 : 0,
    card.role && (Array.isArray(card.role) ? card.role.length : 1) ? 1 : 0,
    card.periods && card.periods.length ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  const blockHeight = blockFieldCount * condensedRowH;
  const x = xPt * scale;
  const y = yPt * scale;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, CARD_BLEED_W * scale, CARD_BLEED_H * scale);
  ctx.clip();

  // Background
  await drawBackground(ctx, x, y, card, scale, { roundedRectPath });

  // Main photo
  const { selectMainPhotoDrawer } = require('./layers/main-photo');
  const { hasEmbeddedBackgroundPhoto } = require('./layers/backgrounds');
  const mainPhotoDrawer = selectMainPhotoDrawer(card);
  if (mainPhotoDrawer && !hasEmbeddedBackgroundPhoto(card)) {
    const { mainPhotoX, mainPhotoY, mainPhotoOptions } = getMainPhotoPlacement(card, x, y, scale);
    await mainPhotoDrawer(ctx, mainPhotoX, mainPhotoY, mainPhotoOptions);
  }

  // Title colour block
  const safeX = x + BLEED * scale;
  const safeY = y + BLEED * scale;
  ctx.save();
  ctx.translate(x, y);
  drawTitleColorBlock(ctx, card, {
    width: CARD_BLEED_W * scale,
    height: CARD_BLEED_H * scale,
    dpi: 72 * scale,
  });
  ctx.restore();

  // Content area geometry
  const margin = 0.15 * INCH * scale;
  const contentX = safeX + margin;
  const contentY = safeY + margin;
  const contentW = CARD_TRIM_W * scale - 2 * margin;
  const contentH = CARD_TRIM_H * scale - 2 * margin;

  // Badge list + placement
  const badgeGap = 0.04 * 72 * scale;
  const badgeList = buildBadgeList(card);
  const dynamicBadgeColumnHeight = badgeList.length * badgeRadius * 2 + (badgeList.length - 1) * badgeGap;
  const badgeY = contentY + (contentH - dynamicBadgeColumnHeight) / 2 + badgeRadius + 60;

  const neonColor = card.neonColor || CATEGORY_COLORS[card.organism_type] || '#02BDF2';
  // Ensure neonColor is set on card so all rendering layers use it consistently
  if (!card.neonColor) {
    card.neonColor = neonColor;
  }

  // First pass: field backgrounds + body text
  drawFunctionalCategory(ctx, contentX + 20, contentY + 40, contentW, contentH, card, scale);
  drawBody(ctx, contentX + 20, contentY + 40, contentW, card, scale, { wrapText });

  // Connector lines + badge icons
  const fieldDefs = getFieldDefinitions(card);
  const funcTextX = (contentX + 20) + Math.round(21 * scale) + badgeRadius + badgeTextGap;
  await drawBadgesAndConnectors(ctx, badgeList, {
    badgeY, badgeRadius, badgeGap, badgeStartX,
    contentX, contentY, contentH, contentW,
    blockHeight, bottomPadding, condensedRowH,
    leftPadding, badgeTextGap, funcTextX,
    scale, neonColor, card, fieldDefs,
  });

  // Final text layer (drawn over connectors)
  drawTitle(ctx, contentX, contentY - 30, contentW, card, scale);
  drawFunctionalCategory(ctx, contentX + 20, contentY + 40, contentW, contentH, card, scale);
  drawBody(ctx, contentX + 20, contentY + 40, contentW, card, scale, { wrapText });
  drawCardNumber(ctx, safeX, safeY, card, scale);
  drawCorners(ctx, safeX, safeY, card, scale);

  if (includeGuides) {
    drawTrim(ctx, safeX, safeY, scale, { roundedRectPath });
  }

  ctx.restore();
}

module.exports = {
  drawCardPNG,
  layoutSheetPNG,
  layoutSinglePagesPNG,
  writeEachCardPNG,
  writeSingleCardPNG,
  getBadgeGeometry,
  getEachCardBaseName,
};

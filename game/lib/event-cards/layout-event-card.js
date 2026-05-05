const { createCanvasInches, writeCanvasPNG, configureCanvasContext } = require('../png');
const { INCH, CARD_TRIM_W, CARD_TRIM_H, CARD_BLEED_W, CARD_BLEED_H, BLEED } = require('../size');
const roundedRectPath = require('../cards/utils/path');
const wrapText = require('../cards/utils/text');
const drawBackground = require('../cards/layers/backgrounds/background');
const drawTrim = require('../cards/layers/trim');
const drawCorners = require('../cards/layers/corners');
const drawCardNumber = require('../cards/layers/card-number');
const drawTitle = require('../cards/layers/title');
const drawBody = require('../cards/layers/body');
const drawFunctionalCategory = require('../cards/layers/detailed-type/category/functional-category');
const { drawTitleColorBlock, CATEGORY_COLORS } = require('../cards/layers/title-color-block');
const { buildBadgeList } = require('../cards/helpers/badge-list');
const { drawBadgesAndConnectors } = require('../cards/helpers/draw-badge-connectors');
const { getEventColorScheme } = require('./color-scheme');

/**
 * Get background drawing functions (matching organism card style)
 */
function getEventBackgroundFunctions() {
  return {
    drawTop: require('../cards/layers/detailed-type/category/functional-category-background-top'),
    drawBottom: require('../cards/layers/detailed-type/category/functional-category-background-bottom'),
  };
}

/**
 * Transform event data into field definitions matching organism card structure
 */
function getEventFieldDefinitions(event) {
  const fields = [];
  const { drawTop, drawBottom } = getEventBackgroundFunctions();

  // Field 1: Effect
  fields.push({
    label: 'Effect',
    main: event.name,
    sub: null,
    drawTop,
    drawBottom,
  });

  // Field 2: Biomes - (negative)
  if (event.biomesBad && event.biomesBad.length) {
    fields.push({
      label: 'Biomes -',
      main: event.biomesBad.slice(0, 2).join(', '),
      sub: event.biomesBad.length > 2 ? `+${event.biomesBad.length - 2} more` : null,
      drawTop,
      drawBottom,
    });
  }

  // Field 3: Biomes + (positive)
  if (event.biomesGood && event.biomesGood.length) {
    fields.push({
      label: 'Biomes +',
      main: event.biomesGood.slice(0, 2).join(', '),
      sub: event.biomesGood.length > 2 ? `+${event.biomesGood.length - 2} more` : null,
      drawTop,
      drawBottom,
    });
  }

  // Field 4: Organisms - (negative)
  if (event.organismsBad && event.organismsBad.length) {
    const orgNames = event.organismsBad.map(o => o.group).slice(0, 2).join(', ');
    fields.push({
      label: 'Organisms -',
      main: orgNames,
      sub: event.organismsBad.length > 2 ? `+${event.organismsBad.length - 2} more` : null,
      drawTop,
      drawBottom,
    });
  }

  // Field 5: Organisms + (positive)
  if (event.organismsGood && event.organismsGood.length) {
    const orgNames = event.organismsGood.map(o => o.group).slice(0, 2).join(', ');
    fields.push({
      label: 'Organisms +',
      main: orgNames,
      sub: event.organismsGood.length > 2 ? `+${event.organismsGood.length - 2} more` : null,
      drawTop,
      drawBottom,
    });
  }

  return fields;
}

/**
 * Create a badge list for event cards (CO2, O2, Biodiversity)
 */
function buildEventBadgeList(event) {
  // Create pseudo-badges matching organism badge structure
  return [
    { type: 'co2', label: 'CO₂' },
    { type: 'o2', label: 'O₂' },
    { type: 'bio', label: 'Bio' },
  ];
}

/**
 * Draw event badges and connectors (custom implementation for stat badges)
 */
async function drawEventBadgesAndConnectors(ctx, badgeList, params, event) {
  // This function is now empty - badges and connectors are removed
  // Title symbols are now drawn in the title area instead
}

/**
 * Transform event into organism-like card object
 */
function eventToCardObject(event, colors) {
  return {
    id: event.name.replace(/\s+/g, '-').toLowerCase(),
    common_name: event.name,
    scientific_name: event.type.replace(/_/g, ' ').toUpperCase(),
    organism_type: event.type,
    titleColor: '#000000',
    background: colors.background,
    neonColor: colors.neon,
    // Store stat values as effects (matching organism card structure for title symbols)
    effects: {
      oxygen: event.o2Change,
      co2: event.co2Change,
      biodiversity: event.biodiversityChange,
    },
    // Dummy values for organism card fields (will be replaced with event-specific fields)
    text: event.effectText,
  };
}

/**
 * Draw an event card PNG using exact organism card rendering path
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
  
  // Create organism-like card object
  const card = eventToCardObject(event, colors);
  
  const { badgeRadius, badgeTextGap, leftPadding, badgeStartX } = getBadgeGeometry(scale);
  const condensedRowH = Math.round((badgeRadius * 2) + (6 * scale)) * 0.60;
  const bottomPadding = Math.round(6 * scale);
  
  // Count event fields
  const blockFieldCount = getEventFieldDefinitions(event).length;
  const blockHeight = blockFieldCount * condensedRowH;
  
  const x = xPt * scale;
  const y = yPt * scale;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, CARD_BLEED_W * scale, CARD_BLEED_H * scale);
  ctx.clip();

  // Background (matching organism card)
  await drawBackground(ctx, x, y, card, scale, { roundedRectPath });

  // Title colour block (matching organism card)
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

  // Content area geometry (matching organism card)
  const margin = 0.15 * INCH * scale;
  const contentX = safeX + margin;
  const contentY = safeY + margin;
  const contentW = CARD_TRIM_W * scale - 2 * margin;
  const contentH = CARD_TRIM_H * scale - 2 * margin;

  // Badge list + placement (matching organism card)
  const badgeGap = 0.04 * 72 * scale;
  const badgeList = buildEventBadgeList(event);
  const dynamicBadgeColumnHeight = badgeList.length * badgeRadius * 2 + (badgeList.length - 1) * badgeGap;
  const badgeY = contentY + (contentH - dynamicBadgeColumnHeight) / 2 + badgeRadius + 60;

  const neonColor = card.neonColor || '#02BDF2';
  
  // Get field definitions with exact organism card structure
  const fieldDefs = getEventFieldDefinitions(event);
  
  // Store on card for use in field drawing
  card._eventFields = fieldDefs;
  
  configureCanvasContext(ctx);

  // First pass: field backgrounds (matching organism card)
  drawFunctionalCategory(ctx, contentX + 20, contentY + 40, contentW, contentH, card, scale);
  drawBody(ctx, contentX + 20, contentY + 40, contentW, card, scale, { wrapText });

  // Final text layer (drawn over connectors) - matching organism card
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

/**
 * Get badge geometry (from organism cards)
 */
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

/**
 * Create a single event card PNG
 * @param {string} outputPath - Path to save PNG
 * @param {Object} event - Prepared event object
 * @param {Object} options - Options (dpi, etc)
 */
async function writeSingleEventCardPNG(outputPath, event, options = {}) {
  const dpi = options.dpi || 300;
  const scale = dpi / 72;

  const { canvas, ctx } = createCanvasInches(CARD_BLEED_W / INCH, CARD_BLEED_H / INCH, dpi);

  await drawEventCardPNG(ctx, 0, 0, event, scale);
  await writeCanvasPNG(canvas, outputPath, dpi);
}

/**
 * Create an event card PNG with front and back side (front/back pair)
 * @param {string} outputPath - Path to save PNG
 * @param {Object} event - Prepared event object
 * @param {Object} options - Options (dpi, etc)
 */
async function writeFrontBackEventCardPNG(outputPath, event, options = {}) {
  const { drawEventCardBack } = require('./layout-event-back');
  const dpi = options.dpi || 300;
  const scale = dpi / 72;
  const gapPt = 0.5 * INCH;

  const totalWidthIn = ((CARD_BLEED_W * 2) + gapPt) / INCH;
  const totalHeightIn = CARD_BLEED_H / INCH;
  
  const { canvas, ctx } = createCanvasInches(totalWidthIn, totalHeightIn, dpi);

  const frontXPt = 0;
  const backXPt = CARD_BLEED_W + gapPt;
  const yPt = 0;

  // Draw back first so front-side clipping/state cannot hide the back panel
  await drawEventCardBack(ctx, backXPt, yPt, scale, event);
  await drawEventCardPNG(ctx, frontXPt, yPt, event, scale, { includeGuides: false });

  await writeCanvasPNG(canvas, outputPath, dpi);
}

module.exports = {
  drawEventCardPNG,
  writeSingleEventCardPNG,
  writeFrontBackEventCardPNG,
};

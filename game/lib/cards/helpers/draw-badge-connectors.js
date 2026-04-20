/**
 * Renders all badge icons and connector lines for a card's badge column.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array}  badgeList - from helpers/badge-list.js
 * @param {object} params    - all layout / style values needed for placement
 */

const drawBiomesBadge = require('../badges/biomes-badge');
const drawTrophicLevelBadge = require('../badges/trophic-level-badge');
const drawRoleBadge = require('../badges/role-badge');
const drawPeriodsBadge = require('../badges/periods-badge');
const drawFunctionalCategoryBadge = require('../badges/functional-category-badge');
const drawBiomesConnector = require('../connectors/biomes-connector');
const drawFunctionalCategoryConnector = require('../connectors/functional-category-connector');
const drawTrophicLevelConnector = require('../connectors/trophic-level-connector');
const drawRoleConnector = require('../connectors/role-connector');
const drawPeriodsConnector = require('../connectors/periods-connector');
const { computeBackgroundRightX } = require('../layers/detailed-type/category/field-helpers');
const { CATEGORY_COLORS } = require('../layers/title-color-block');

async function drawBadgesAndConnectors(ctx, badgeList, params) {
  const {
    badgeY, badgeRadius, badgeGap, badgeStartX,
    contentX, contentY, contentH, contentW,
    blockHeight, bottomPadding, condensedRowH,
    leftPadding, badgeTextGap, funcTextX,
    scale, neonColor, card, fieldDefs,
  } = params;

  // Max text width: from funcTextX to the content area right edge, minus a small margin.
  // Matches the cap applied in functional-category.js so connector end points align with the drawn box.
  const maxTextWidth = (contentX + 20 + contentW) - funcTextX - Math.round(8 * scale);

  // --- Pass 1: biome badge icons (drawn first for z-order) ---
  for (let i = 0; i < badgeList.length; i++) {
    const fieldY = badgeY + i * (badgeRadius * 2 + badgeGap);
    const badge = badgeList[i];
    if (badge.type === 'biome') {
      await drawBiomesBadge(ctx, badgeStartX, fieldY, badgeRadius, { ...card, biomes: [badge.label] }, scale, neonColor);
    }
  }

  // --- Pass 2: role + period badge icons ---
  for (let i = 0; i < badgeList.length; i++) {
    const fieldY = badgeY + i * (badgeRadius * 2 + badgeGap);
    const badge = badgeList[i];
    if (badge.type === 'role') {
      await drawRoleBadge(ctx, badgeStartX, fieldY, badgeRadius, card, scale, neonColor);
    }
    if (badge.type === 'period') {
      await drawPeriodsBadge(ctx, badgeStartX, fieldY, badgeRadius, { ...card, periods: [badge.label] }, scale, neonColor);
    }
  }

  // --- Pass 3: connector lines + remaining badges (highest z-order) ---
  for (let i = 0; i < badgeList.length; i++) {
    const fieldY = badgeY + i * (badgeRadius * 2 + badgeGap);
    const badge = badgeList[i];
    const labelX = contentX + leftPadding + badgeRadius + badgeTextGap;

    if (badge.type === 'functional') {
      const fieldBlockY = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale) + 0 * condensedRowH;
      const fieldTextY = fieldBlockY + Math.round(7 * scale) + 40;
      const fieldDef = fieldDefs.find(f => f.label === 'Type') || { label: 'Type', main: card.organism_type || '', sub: null };
      const backgroundRightX = computeBackgroundRightX(ctx, { ...fieldDef, textX: funcTextX, scale, maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined });
      const color = CATEGORY_COLORS[card.organism_type] || '#02BDF2';
      drawFunctionalCategoryConnector(ctx, badgeStartX, fieldY, labelX, fieldTextY, badgeRadius, scale, backgroundRightX, color);
      await drawFunctionalCategoryBadge(ctx, badgeStartX, fieldY, badgeRadius, card, scale, color);
    }

    if (badge.type === 'biome') {
      const fieldBlockY = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale) + 1 * condensedRowH;
      const fieldTextY = fieldBlockY + Math.round(7 * scale) + 40;
      const fieldDef = fieldDefs.find(f => f.label === 'Biomes') || { label: 'Biomes', main: (card.biomes || []).join(', '), sub: null };
      const backgroundRightX = computeBackgroundRightX(ctx, { ...fieldDef, textX: funcTextX, scale, maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined });
      drawBiomesConnector(ctx, badgeStartX, fieldY, labelX, fieldTextY, badgeRadius, scale, backgroundRightX, neonColor);
    }

    if (badge.type === 'trophic') {
      const fieldBlockY = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale) + 2 * condensedRowH;
      const fieldTextY = fieldBlockY + Math.round(7 * scale) + 40;
      const fieldDef = fieldDefs.find(f => f.label === 'Trophic Level') || { label: 'Trophic Level', main: card.trophic_level || '', sub: null };
      const backgroundRightX = computeBackgroundRightX(ctx, { ...fieldDef, textX: funcTextX, scale, maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined });
      drawTrophicLevelConnector(ctx, badgeStartX, fieldY, labelX - 18 * scale, fieldTextY, badgeRadius, scale, backgroundRightX, neonColor);
      await drawTrophicLevelBadge(ctx, badgeStartX, fieldY, badgeRadius, card, scale, neonColor);
    }

    if (badge.type === 'role') {
      const fieldBlockY = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale) + 3 * condensedRowH;
      const fieldTextY = fieldBlockY + Math.round(7 * scale) + 40;
      const fieldDef = fieldDefs.find(f => f.label === 'Role') || { label: 'Role', main: (Array.isArray(card.role) ? card.role[0] : card.role) || '', sub: null };
      const backgroundRightX = computeBackgroundRightX(ctx, { ...fieldDef, textX: funcTextX, scale, maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined });
      drawRoleConnector(ctx, badgeStartX, fieldY, labelX - 18 * scale, fieldTextY, badgeRadius, scale, backgroundRightX, neonColor);
    }

    if (badge.type === 'period') {
      const fieldBlockY = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale) + 4 * condensedRowH;
      const fieldTextY = fieldBlockY + Math.round(7 * scale) + 40;
      const fieldDef = fieldDefs.find(f => f.label === 'Periods') || { label: 'Periods', main: (card.periods || []).join(', '), sub: null };
      const backgroundRightX = computeBackgroundRightX(ctx, { ...fieldDef, textX: funcTextX, scale, maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined });
      drawPeriodsConnector(ctx, badgeStartX, fieldY, labelX, fieldTextY, badgeRadius, scale, backgroundRightX, neonColor);
    }
  }
}

module.exports = { drawBadgesAndConnectors };

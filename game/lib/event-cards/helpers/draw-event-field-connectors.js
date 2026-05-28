const drawEffectFieldRow = require('../fields/effect');
const drawBiomesFieldRow = require('../fields/biomes');
const drawOrganismsFieldRow = require('../fields/organisms');
const drawPeriodsFieldRow = require('../fields/periods');
const { computeBackgroundRightX } = require('../../cards/layers/detailed-type/category/field-helpers');
const drawEventBiomesConnector = require('../connectors/biomes-connector');
const drawEventOrganismsConnector = require('../connectors/organisms-connector');
const drawEventPeriodsConnector = require('../connectors/periods-connector');

function calculateFieldGeometry(ctx, card, layout) {
  const {
    contentX,
    contentY,
    contentW,
    contentH,
    scale,
    leftPadding,
    badgeRadius,
    badgeTextGap,
  } = layout;

  const fields = card._eventFields || [];
  if (!fields.length) {
    return { textX: 0, maxTextWidth: 0, byLabel: {} };
  }

  const textX = contentX + leftPadding + badgeRadius + badgeTextGap;
  const maxTextWidth = contentW - leftPadding - badgeRadius - badgeTextGap - Math.round(8 * scale);
  const bottomPadding = Math.round(6 * scale);

  const fieldDrawers = {
    effect: drawEffectFieldRow,
    biomes: drawBiomesFieldRow,
    organisms: drawOrganismsFieldRow,
    periods: drawPeriodsFieldRow,
  };

  const heights = [];
  let totalHeight = 0;

  fields.forEach((field) => {
    const fieldType = field.label ? field.label.toLowerCase() : 'effect';
    const drawer = fieldDrawers[fieldType] || drawEffectFieldRow;
    const result = drawer(ctx, {
      textX,
      rowY: -999999,
      scale,
      color: card.neonColor,
      titleColor: card.titleColor,
      main: field.main || '',
      sub: field.sub || null,
      maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined,
      hexToRgba: () => '',
    });

    const height = result && result.height ? result.height : 0;
    heights.push(height);
    totalHeight += height;
  });

  const blockY = contentY + contentH - totalHeight - bottomPadding + Math.round(18 * scale);
  const byLabel = {};
  let currentY = blockY;

  fields.forEach((field, idx) => {
    const label = (field.label || '').toLowerCase();
    byLabel[label] = {
      rowY: currentY,
      height: heights[idx],
      field,
    };
    currentY += heights[idx];
  });

  return { textX, maxTextWidth, byLabel };
}

module.exports = function drawEventFieldConnectors(ctx, card, layout) {
  const {
    badgeStartX,
    badgeRadius,
    badgeTextGap,
    scale,
  } = layout;

  const fieldGeometry = layout.fieldGeometry || calculateFieldGeometry(ctx, card, layout);
  const { textX, maxTextWidth, byLabel } = fieldGeometry;
  const neonColor = card.neonColor || '#02BDF2';
  // Keep event connector circles on the same badge-column X used by organism cards.
  const effectiveBadgeX = badgeStartX;
  const connectorStartYOffset = Math.round((badgeRadius * 0.65) + (4 * scale));
  const biomesFieldYAdjustPx = 10;
  const organismsFieldYAdjustPx = 10;

  // Match organism-card badge column feel: fixed vertical step between connector circles.
  const badgeGap = 0.04 * 72 * scale;
  const badgeStep = (badgeRadius * 2) + badgeGap;
  const connectorOrder = ['biomes', 'organisms', 'periods'].filter((label) => !!byLabel[label]);
  const badgeYByLabel = {};
  if (connectorOrder.length) {
    const firstLabel = connectorOrder[0];
    const firstFieldY = byLabel[firstLabel].rowY + Math.round(4 * scale);
    const firstBadgeY = firstFieldY - connectorStartYOffset;
    connectorOrder.forEach((label, idx) => {
      badgeYByLabel[label] = firstBadgeY + (idx * badgeStep);
    });
  }

  const biomesMeta = byLabel.biomes;
  if (biomesMeta) {
    const fieldY = biomesMeta.rowY + Math.round(4 * scale) + biomesFieldYAdjustPx;
    const badgeY = Number.isFinite(badgeYByLabel.biomes)
      ? badgeYByLabel.biomes
      : (fieldY - connectorStartYOffset);
    const backgroundRightX = computeBackgroundRightX(ctx, {
      label: biomesMeta.field.label,
      main: biomesMeta.field.main || '',
      sub: biomesMeta.field.sub || null,
      textX,
      scale,
      maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined,
    });

    drawEventBiomesConnector(
      ctx,
      effectiveBadgeX,
      badgeY,
      textX,
      fieldY,
      badgeRadius,
      scale,
      backgroundRightX,
      neonColor
    );
  }

  const organismsMeta = byLabel.organisms;
  if (organismsMeta) {
    const fieldY = organismsMeta.rowY + Math.round(4 * scale) + organismsFieldYAdjustPx;
    const badgeY = Number.isFinite(badgeYByLabel.organisms)
      ? badgeYByLabel.organisms
      : (fieldY - connectorStartYOffset);
    const backgroundRightX = computeBackgroundRightX(ctx, {
      label: organismsMeta.field.label,
      main: organismsMeta.field.main || '',
      sub: organismsMeta.field.sub || null,
      textX,
      scale,
      maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined,
    });

    drawEventOrganismsConnector(
      ctx,
      effectiveBadgeX,
      badgeY,
      textX - (18 * scale),
      fieldY,
      badgeRadius,
      scale,
      backgroundRightX,
      neonColor
    );
  }

  const periodsMeta = byLabel.periods;
  if (periodsMeta) {
    const fieldY = periodsMeta.rowY + Math.round(4 * scale);
    const badgeY = Number.isFinite(badgeYByLabel.periods)
      ? badgeYByLabel.periods
      : (fieldY - connectorStartYOffset);
    const backgroundRightX = computeBackgroundRightX(ctx, {
      label: periodsMeta.field.label,
      main: periodsMeta.field.main || '',
      sub: periodsMeta.field.sub || null,
      textX,
      scale,
      maxWidth: maxTextWidth > 0 ? maxTextWidth : undefined,
    });

    drawEventPeriodsConnector(
      ctx,
      effectiveBadgeX,
      badgeY,
      textX,
      fieldY,
      badgeRadius,
      scale,
      backgroundRightX,
      neonColor
    );
  }
};

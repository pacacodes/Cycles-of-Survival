// Draw functional category, then taxonomy and other fields in JSON order, below it
// Removed unused taxonomy field imports (kingdom, phylum, class, order, family, genus, species)

const drawFunctionalCategoryBadge = require('../../../badges/functional-category-badge');
const drawBiomesBadge = require('../../../badges/biomes-badge');
const drawRoleBadge = require('../../../badges/role-badge');
const drawPeriodsBadge = require('../../../badges/periods-badge');
const drawTrophicLevelBadge = require('../../../badges/trophic-level-badge');

module.exports = function drawFunctionalCategory(ctx, contentX, contentY, contentW, contentH, card, scale) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = card.titleColor || '#000000';
  const badgeRadius = 0.18 * 72 * scale; // 0.18 inch in points
  const badgeTextGap = 10 * scale;
  // Increase left padding to ensure title/fields don't get cut off on the right
  const leftPadding = Math.round(36 * scale); // Shift fields/data to the right by 20px more
  // Margin for bottom fields and taxonomy
  const bottomMargin = 0.15 * scale * 72; // 0.15 inch in points
  // Increase row height for more space between fields
  // Reduce row height for more compact field spacing
  const rowH = Math.round((badgeRadius * 2) + (6 * scale));

  // Calculate starting y for condensed block so last field isn't cut off
  const blockFieldCount = [card.organism_type ? 1 : 0, card.biomes && card.biomes.length ? 1 : 0, card.trophic_level ? 1 : 0, card.role && (Array.isArray(card.role) ? card.role.length : 1) ? 1 : 0, card.periods && card.periods.length ? 1 : 0].reduce((a, b) => a + b, 0);
  // Reduce vertical padding between each field
  const condensedRowH = Math.round(rowH * 0.60); // slightly more compact, but not too tight
  const blockHeight = blockFieldCount * condensedRowH;
  // (No detached circle placeholders; only functional category badge remains)
  const bottomPadding = Math.round(6 * scale); // less space at the bottom
  let blockY = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale); // move fields down slightly
  let blockRow = 0;

  // Helper for RGBA
  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0,2), 16);
    let g = parseInt(hex.substring(2,4), 16);
    let b = parseInt(hex.substring(4,6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // Helper to get the color block color for this card
  function getCardColorBlock(card) {
    const CATEGORY_COLORS = require('../../title-color-block').CATEGORY_COLORS;
    const category = card.organism_type || card.organism_type;
    return CATEGORY_COLORS[category] || '#CCCCCC';
  }

  function titleCaseWords(value) {
    return (value || '').replace(/\b([a-z])/g, c => c.toUpperCase());
  }

  // Draw functional category (as field, with split background)
  if (card.organism_type) {
    let rowY = blockY + blockRow * condensedRowH + 2;
    ctx.save();
    let color = getCardColorBlock(card);
    ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    const label = 'Organism Type';
    const value = titleCaseWords((card.organism_type.match(/^(.*?)(\s*\(.*?\))?$/) || [null, card.organism_type])[1].trim());
    const labelX = contentX + leftPadding + badgeRadius + badgeTextGap;
    const labelW = ctx.measureText(label).width;
    ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    const valueX = labelX;
    const valueW = ctx.measureText(value).width;
    const minX = Math.min(labelX, valueX);
    const maxX = Math.max(labelX + labelW, valueX + valueW);
    const boxPadX = 4 * scale;
    const boxPadY = 2 * scale;
    const boxRadius = 6 * scale;
    const boxH = Math.round(7 * scale) + Math.round(6 * scale) + 2 * boxPadY;
    const rx = minX - boxPadX;
    const ry = rowY - boxPadY;
    const rw = (maxX - minX) + 2 * boxPadX;
    const rh = boxH;
    // Split background: top and bottom
    const drawTop = require('./functional-category-background-top');
    const drawBottom = require('./functional-category-background-bottom');
    drawTop(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, 0.45);
    drawBottom(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, 0.8);
    ctx.restore();
    // Draw text
    ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 10 * scale;
    ctx.fillText(label, contentX + leftPadding + badgeRadius + badgeTextGap, rowY);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    if (value) {
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 10 * scale;
      ctx.fillText(value, contentX + leftPadding + badgeRadius + badgeTextGap, rowY + Math.round(7 * scale));
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    blockRow++;
  }

  // Draw biomes (split background, color-matched)
  if (card.biomes && card.biomes.length) {
    let rowY = blockY + blockRow * condensedRowH + 2;
    ctx.save();
    let color = getCardColorBlock(card);
    ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    const label = 'Biomes';
    const value = card.biomes.map(b => titleCaseWords(b)).join(', ');
    const labelX = contentX + leftPadding + badgeRadius + badgeTextGap;
    const labelW = ctx.measureText(label).width;
    ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    const valueX = labelX;
    const valueW = ctx.measureText(value).width;
    const minX = Math.min(labelX, valueX);
    const maxX = Math.max(labelX + labelW, valueX + valueW);
    const boxPadX = 4 * scale;
    const boxPadY = 2 * scale;
    const boxRadius = 6 * scale;
    const boxH = Math.round(7 * scale) + Math.round(6 * scale) + 2 * boxPadY;
    const rx = minX - boxPadX;
    const ry = rowY - boxPadY;
    const rw = (maxX - minX) + 2 * boxPadX;
    const rh = boxH;
    // Split background: top and bottom
    const drawTop = require('./biomes-background-top');
    const drawBottom = require('./biomes-background-bottom');
    drawTop(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, 0.45);
    drawBottom(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, 0.8);
    ctx.restore();
    ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 10 * scale;
    ctx.fillText(label, contentX + leftPadding + badgeRadius + badgeTextGap, rowY);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    if (value) {
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 10 * scale;
      ctx.fillText(value, contentX + leftPadding + badgeRadius + badgeTextGap, rowY + Math.round(7 * scale));
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    blockRow++;
  }

  // Draw Trophic Level (split background, color-matched)
  if (card.trophic_level) {
    let rowY = blockY + blockRow * condensedRowH + 2;
    ctx.save();
    let color = getCardColorBlock(card);
    ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    const label = 'Trophic Level';
    const matchTrophic = card.trophic_level.match(/^(.*?)(\s*\((.*?)\))?$/);
    const value = titleCaseWords(matchTrophic ? matchTrophic[1] : card.trophic_level);
    const labelX = contentX + leftPadding + badgeRadius + badgeTextGap;
    const labelW = ctx.measureText(label).width;
    ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    const valueX = labelX;
    const valueW = ctx.measureText(value).width;
    const minX = Math.min(labelX, valueX);
    const maxX = Math.max(labelX + labelW, valueX + valueW);
    const boxPadX = 4 * scale;
    const boxPadY = 2 * scale;
    const boxRadius = 6 * scale;
    const boxH = Math.round(7 * scale) + Math.round(6 * scale) + 2 * boxPadY;
    const rx = minX - boxPadX;
    const ry = rowY - boxPadY;
    const rw = (maxX - minX) + 2 * boxPadX;
    const rh = boxH;
    // Split background: top and bottom
    const drawTop = require('./trophic-level-background-top');
    const drawBottom = require('./trophic-level-background-bottom');
    drawTop(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, 0.45);
    drawBottom(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, 0.8);
    ctx.restore();
    ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 10 * scale;
    ctx.fillText(label, contentX + leftPadding + badgeRadius + badgeTextGap, rowY);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    if (value) {
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 10 * scale;
      ctx.fillText(value, contentX + leftPadding + badgeRadius + badgeTextGap, rowY + Math.round(7 * scale));
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    blockRow++;
  }

  // Draw Role (split background, color-matched)
  if (card.role && (Array.isArray(card.role) ? card.role.length : card.role)) {
    let rowY = blockY + blockRow * condensedRowH + 2;
    ctx.save();
    let color = getCardColorBlock(card);
    ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    const label = 'Role';
    const roleVal = Array.isArray(card.role) ? card.role[0] : card.role;
    const value = (roleVal || '').replace(/_/g, ' ').replace(/\b([a-z])/g, c => c.toUpperCase());
    const labelX = contentX + leftPadding + badgeRadius + badgeTextGap;
    const labelW = ctx.measureText(label).width;
    ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    const valueX = labelX;
    const valueW = ctx.measureText(value).width;
    const minX = Math.min(labelX, valueX);
    const maxX = Math.max(labelX + labelW, valueX + valueW);
    const boxPadX = 4 * scale;
    const boxPadY = 2 * scale;
    const boxRadius = 6 * scale;
    const boxH = Math.round(7 * scale) + Math.round(6 * scale) + 2 * boxPadY;
    const rx = minX - boxPadX;
    const ry = rowY - boxPadY;
    const rw = (maxX - minX) + 2 * boxPadX;
    const rh = boxH;
    const drawTop = require('./role-background-top');
    const drawBottom = require('./role-background-bottom');
    drawTop(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, 0.45);
    drawBottom(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, 0.8);
    ctx.restore();
    ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 10 * scale;
    ctx.fillText(label, contentX + leftPadding + badgeRadius + badgeTextGap, rowY);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    if (value) {
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 10 * scale;
      ctx.fillText(value, contentX + leftPadding + badgeRadius + badgeTextGap, rowY + Math.round(7 * scale));
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    blockRow++;
  }

  // Draw Periods (split background, color-matched)
  if (card.periods && card.periods.length) {
    let rowY = blockY + blockRow * condensedRowH + 2;
    ctx.save();
    let color = getCardColorBlock(card);
    ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    const label = 'Periods';
    const value = card.periods.map(p => titleCaseWords(p)).join(', ');
    const labelX = contentX + leftPadding + badgeRadius + badgeTextGap;
    const labelW = ctx.measureText(label).width;
    ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    const valueX = labelX;
    const valueW = ctx.measureText(value).width;
    const minX = Math.min(labelX, valueX);
    const maxX = Math.max(labelX + labelW, valueX + valueW);
    const boxPadX = 4 * scale;
    const boxPadY = 2 * scale;
    const boxRadius = 6 * scale;
    const boxH = Math.round(7 * scale) + Math.round(6 * scale) + 2 * boxPadY;
    const rx = minX - boxPadX;
    const ry = rowY - boxPadY;
    const rw = (maxX - minX) + 2 * boxPadX;
    const rh = boxH;
    // Split background: top and bottom
    const drawTop = require('./periods-background-top');
    const drawBottom = require('./periods-background-bottom');
    drawTop(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, 0.45);
    drawBottom(ctx, rx, ry, rw, rh, boxRadius, color, hexToRgba, 0.8);
    ctx.restore();
    ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 10 * scale;
    ctx.fillText(label, contentX + leftPadding + badgeRadius + badgeTextGap, rowY);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
    if (value) {
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 10 * scale;
      ctx.fillText(value, contentX + leftPadding + badgeRadius + badgeTextGap, rowY + Math.round(7 * scale));
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    blockRow++;
  }

  ctx.restore();
};

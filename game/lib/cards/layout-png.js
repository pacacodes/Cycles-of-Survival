    // Draw connector for biomes badge only
    const drawBiomesConnector = require('./connectors/biomes-connector');
  // Draw connector for functional category badge only
  const drawFunctionalCategoryConnector = require('./connectors/functional-category-connector');
const drawFunctionalCategory = require('./layers/detailed-type/category/functional-category');
const { drawTitleColorBlock } = require('./layers/title-color-block');
const fs = require('fs');
const path = require('path');
const { configureCanvasContext, createCanvasInches, writeCanvasPNG } = require('../png');
const { INCH, CARD_TRIM_W, CARD_TRIM_H, CARD_BLEED_W, CARD_BLEED_H, BLEED, PAGE_W, PAGE_H, COLS, ROWS, GAP_X, GAP_Y } = require('../size');
const roundedRectPath = require('./utils/path');
const wrapText = require('./utils/text');
const { drawCardGuides } = require('./helpers/guides');
const { writeFrontBackPairPNG } = require('./layout-each-pair');
const drawBackground = require('./layers/backgrounds/background');
const drawTrim = require('./layers/trim');
const drawTitle = require('./layers/title');
const drawBody = require('./layers/body');
const drawCorners = require('./layers/corners');
const drawCardNumber = require('./layers/card-number');
const drawFunctionalCategoryBadge = require('./badges/functional-category-badge');

function getBadgeGeometry(scale = 1) {
  const badgeRadius = 0.18 * 72 * scale;
  const badgeTextGap = 10 * scale;
  const leftPadding = Math.round(16 * scale);
  const margin = 0.15 * 72 * scale;
  const BLEED = 0.125 * 72 * scale;
  const CARD_TRIM_W = 2.5 * 72 * scale;
  const safeX = BLEED;
  const contentX = safeX + margin;
  // Align badges so the space from badge edge to card edge matches the title's left margin
  const badgeStartX = contentX + leftPadding - 10 * scale;
  return { badgeRadius, badgeTextGap, leftPadding, badgeStartX };
}

async function drawCardPNG(ctx, xPt, yPt, card, scale, options = {}) {
  const includeGuides = options.includeGuides !== false;
  // Z-order: main photo (very back), then text backgrounds/text, then connector lines, then trim/corners
  const { badgeRadius, badgeTextGap, leftPadding, badgeStartX } = getBadgeGeometry(scale);
  const condensedRowH = Math.round((badgeRadius * 2) + (6 * scale)) * 0.60;
  const bottomPadding = Math.round(6 * scale);
  const blockFieldCount = [card.organism_type ? 1 : 0, card.biomes && card.biomes.length ? 1 : 0, card.trophic_level ? 1 : 0, card.eras && card.eras.length ? 1 : 0, card.periods && card.periods.length ? 1 : 0].reduce((a, b) => a + b, 0);
  const blockHeight = blockFieldCount * condensedRowH;
  const corner = 10 * scale;
  const x = xPt * scale;
  const y = yPt * scale;

  // Constrain all front-card drawing to the bleed rectangle.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, CARD_BLEED_W * scale, CARD_BLEED_H * scale);
  ctx.clip();
  const isCard1 = (card && card.card_label === 'Card 1') ||
    ((card && card.scientific_name || '').toLowerCase() === 'anabaena sp.');
  const isCard2 = (card && card.card_label === 'Card 2') ||
    ((card && card.scientific_name || '').toLowerCase() === 'thalassiosira pseudonana');
  const isCard4 = (card && card.card_label === 'Card 4') ||
    ((card && card.scientific_name || '').toLowerCase() === 'escherichia coli');
  const isCard21 = (card && card.card_label === 'Card 21') ||
    ((card && card.scientific_name || '').toLowerCase() === 'quercus robur');
  const isCard29 = card && card.card_label === 'Card 29';
  const isCard30 = card && card.card_label === 'Card 30';
  const isCard31 = card && card.card_label === 'Card 31';
  const isCard33 = card && card.card_label === 'Card 33';
  const isCard32 = (card && card.card_label === 'Card 32') ||
    ((card && card.scientific_name || '').toLowerCase() === 'esox lucius');
  const isCard36 = (card && card.card_label === 'Card 36') ||
    ((card && card.scientific_name || '').toLowerCase() === 'orcinus orca');
  const isCard39 = card && card.card_label === 'Card 39';
  const isCard49 = (card && card.card_label === 'Card 49') ||
    ((card && card.scientific_name || '').toLowerCase() === 'hylonomus lyelli');
  const isCard58 = (card && card.card_label === 'Card 58') ||
    ((card && card.scientific_name || '').toLowerCase() === 'brachiosaurus altithorax');
  const isCard57 = (card && card.card_label === 'Card 57') ||
    ((card && card.scientific_name || '').toLowerCase() === 'stegosaurus stenops');
  const isCard59 = (card && card.card_label === 'Card 59') ||
    ((card && card.scientific_name || '').toLowerCase() === 'velociraptor mongoliensis');
  const isCard60 = card && card.card_label === 'Card 60';
  const isCard62 = (card && card.card_label === 'Card 62') ||
    ((card && card.scientific_name || '').toLowerCase() === 'triceratops horridus');
  const isCard63 = card && card.card_label === 'Card 63';
  const isCard64 = card && card.card_label === 'Card 64';
  const isCard65 = card && card.card_label === 'Card 65';
  const isCard66 = card && card.card_label === 'Card 66';
  const isCard68 = card && card.card_label === 'Card 68';
  const isCard69 = card && card.card_label === 'Card 69';
  const isCard70 = card && card.card_label === 'Card 70';
  const isCard71 = card && card.card_label === 'Card 71';
  const isCard72 = card && card.card_label === 'Card 72';
  const isCard73 = card && card.card_label === 'Card 73';
  const isCard74 = card && card.card_label === 'Card 74';
  const isCard75 = card && card.card_label === 'Card 75';
  const isCard76 = (card && card.card_label === 'Card 76') ||
    ((card && card.scientific_name || '').toLowerCase() === 'pteropus vampyrus');
  const isCard77 = (card && card.card_label === 'Card 77') ||
    ((card && card.scientific_name || '').toLowerCase() === 'schistocerca gregaria');
  const isCard78 = (card && card.card_label === 'Card 78') ||
    ((card && card.scientific_name || '').toLowerCase() === 'apis mellifera');
  const isCard79 = (card && card.card_label === 'Card 79') ||
    ((card && card.scientific_name || '').toLowerCase() === 'atta cephalotes');
  const isCard80 = (card && card.card_label === 'Card 80') ||
    ((card && card.scientific_name || '').toLowerCase() === 'cladonia rangiferina');
  const isCard81 = (card && card.card_label === 'Card 81') ||
    ((card && card.scientific_name || '').toLowerCase() === 'neophron percnopterus');
  const isCard82 = (card && card.card_label === 'Card 82') ||
    ((card && card.scientific_name || '').toLowerCase() === 'aspergillus fumigatus');
  const isCard83 = (card && card.card_label === 'Card 83') ||
    ((card && card.scientific_name || '').toLowerCase() === 'tenebrio molitor');
  const isCard85 = (card && card.card_label === 'Card 85') ||
    ((card && card.scientific_name || '').toLowerCase() === 'argiope bruennichi');
  const isCard87 = (card && card.card_label === 'Card 87') ||
    ((card && card.scientific_name || '').toLowerCase() === 'panthera onca');
  const isCard88 = (card && card.card_label === 'Card 88') ||
    ((card && card.scientific_name || '').toLowerCase() === 'castor canadensis');
  const isCard89 = (card && card.card_label === 'Card 89') ||
    ((card && card.scientific_name || '').toLowerCase() === 'acropora cervicornis');
  // Background
  await drawBackground(ctx, x, y, card, scale, { roundedRectPath });
  // Main photo
  const { selectMainPhotoDrawer } = require('./layers/main-photo');
  const { hasEmbeddedBackgroundPhoto } = require('./layers/backgrounds');
  const mainPhotoDrawer = selectMainPhotoDrawer(card);
  // Global rule: render main photo as the first layer above the background/base.
  if (mainPhotoDrawer && !hasEmbeddedBackgroundPhoto(card)) {
    let mainPhotoX = isCard4
      ? x + 38
      : (isCard36
        ? x - 4
        : (isCard49
          ? x - 10
                  : (isCard59 ? x - 95 : (isCard62 ? x - 3 : (isCard63 ? x - 50 : (isCard64 ? x - 40 : (isCard70 ? x + 10 : (isCard72 ? x + 40 : (isCard73 ? x + 10 : (isCard75 ? x - 20 : (isCard76 ? x - 20 : (isCard78 ? x - 80 : (isCard82 ? x - 40 : (isCard83 ? x - 5 : (isCard85 ? x - 85 : (isCard87 ? x : (isCard88 ? x + 10 : (isCard89 ? x + 57 : x))))))))))))))))));
                let mainPhotoY = isCard36 ? y + 50 : (isCard62 ? y + 5 : (isCard63 ? y - 10 : (isCard69 ? y - 110 : (isCard70 ? y - 10 : (isCard72 ? y - 10 : (isCard73 ? y - 60 : (isCard74 ? y - 50 : (isCard75 ? y - 10 : (isCard76 ? y - 160 : (isCard77 ? y - 20 : (isCard78 ? y - 20 : (isCard79 ? y - 40 : (isCard83 ? y - 25 : (isCard88 ? y - 30 : (isCard85 ? y - 7 : (isCard87 ? y - 20 : y))))))))))))))));
    if (isCard57) {
      mainPhotoX -= 40;
      mainPhotoY -= 60;
    }
    if (isCard30) {
      mainPhotoX -= 125;
      mainPhotoY -= 75;
    }
    if (isCard31) {
      mainPhotoX -= 20;
      mainPhotoY -= 20;
    }
    if (isCard32) {
      mainPhotoX += 40;
      mainPhotoY -= 57;
    }
    if (isCard33) {
      mainPhotoX -= 20;
      mainPhotoY -= 30;
    }
    if (isCard58) {
      mainPhotoX -= 90;
      mainPhotoY -= 5;
    }
    if (isCard1) {
      mainPhotoX -= 10;
    }
    if (isCard2) {
      mainPhotoX -= 20;
    }
    if (isCard4) {
      mainPhotoX -= 10;
      mainPhotoY -= 30;
    }
    if (isCard21) {
      mainPhotoX += 25;
    }
    if (isCard29) {
      mainPhotoX -= 40;
    }
    if (isCard60) {
      mainPhotoX -= 10;
      mainPhotoY += 0;
    }
    if (isCard59) {
      mainPhotoX -= 18;
      mainPhotoY -= 20;
    }
    if (isCard62) {
      mainPhotoX -= 60;
      mainPhotoY -= 130;
    }
    if (isCard65) {
      mainPhotoX -= 50;
    }
    if (isCard66) {
      mainPhotoX -= 50;
      mainPhotoY -= 70;
    }
    if (isCard68) {
      mainPhotoX += 20;
      mainPhotoY += 0;
    }
    if (isCard89) {
      mainPhotoY -= 80;
    }
    if (isCard39) {
      mainPhotoX -= 60;
      mainPhotoY += 60;
    }
    const mainPhotoOptions = {
      width: CARD_BLEED_W * scale,
      height: CARD_BLEED_H * scale,
      scale,
      card,
      photoFitMode: 'contain',
    };
    if (isCard68 || isCard69 || isCard71 || isCard32 || isCard62) {
      mainPhotoOptions.flipHorizontal = true;
    }
    if (isCard2) {
      mainPhotoOptions.photoScaleMultiplier = 0.96;
    } else if (isCard4) {
      mainPhotoOptions.photoScaleMultiplier = 1.00;
    } else if (isCard21) {
      mainPhotoOptions.photoScaleMultiplier = 0.97;
    } else if (isCard29) {
      mainPhotoOptions.photoScaleMultiplier = 0.75;
    } else if (isCard30) {
      mainPhotoOptions.photoScaleMultiplier = 1.19;
    } else if (isCard33) {
      mainPhotoOptions.photoScaleMultiplier = 0.95;
    } else if (isCard39) {
      mainPhotoOptions.photoScaleMultiplier = 0.80;
    } else if (isCard58) {
      mainPhotoOptions.photoScaleMultiplier = 1.11;
    } else if (isCard59) {
      mainPhotoOptions.photoScaleMultiplier = 0.98;
    } else if (isCard60) {
      mainPhotoOptions.photoScaleMultiplier = 1.02;
      mainPhotoOptions.photoFitMode = 'contain';
    } else if (isCard69) {
      mainPhotoOptions.photoScaleMultiplier = 1.05;
    } else if (isCard73) {
      mainPhotoOptions.photoScaleMultiplier = 1.10;
    } else if (isCard76) {
      mainPhotoOptions.photoScaleMultiplier = 1.10;
    } else if (isCard78) {
      mainPhotoOptions.photoScaleMultiplier = 1.20;
    } else if (isCard80) {
      mainPhotoOptions.photoScaleMultiplier = 0.95;
    } else if (isCard81) {
      mainPhotoOptions.photoScaleMultiplier = 0.95;
      mainPhotoOptions.photoFitMode = 'contain';
    } else if (isCard88) {
      mainPhotoOptions.photoScaleMultiplier = 1.15;
    } else if (isCard62) {
      mainPhotoOptions.photoScaleMultiplier = 1.05;
    } else if (isCard4 || isCard36) {
      mainPhotoOptions.photoScaleMultiplier = 1.10;
    } else if (isCard63) {
      mainPhotoOptions.photoScaleMultiplier = 1.03;
    } else if (isCard85) {
      mainPhotoOptions.photoScaleMultiplier = 1.10;
      mainPhotoOptions.photoFitMode = 'contain';
    } else if (isCard87) {
      mainPhotoOptions.photoScaleMultiplier = 1.05;
    } else if (isCard65) {
      mainPhotoOptions.photoScaleMultiplier = 1.02;
    } else if (isCard66) {
      mainPhotoOptions.photoScaleMultiplier = 1.02;
    } else if (isCard89) {
      mainPhotoOptions.photoScaleMultiplier = 1.05;
    }
    await mainPhotoDrawer(ctx, mainPhotoX, mainPhotoY, mainPhotoOptions);
  }

  const layout = {
    width: CARD_TRIM_W * scale,
    height: CARD_TRIM_H * scale,
    dpi: 72 * scale,
  };
  // Trim origin (card bounds inside bleed)
  const safeX = x + BLEED * scale;
  const safeY = y + BLEED * scale;
  // Keep prior top placement, but span full bleed width left-to-right.
  ctx.save();
  ctx.translate(x, y);
  drawTitleColorBlock(ctx, card, {
    width: CARD_BLEED_W * scale,
    height: CARD_BLEED_H * scale,
    dpi: 72 * scale,
  });
  ctx.restore();

  // Trim outline (drawn later for guide)
  // Content area
  const margin = 0.15 * INCH * scale;
  const contentX = safeX + margin;
  const contentY = safeY + margin;
  const contentW = CARD_TRIM_W * scale - 2 * margin;
  const contentH = CARD_TRIM_H * scale - 2 * margin;
  // Draw badges (left column)
  const badgeGap = 0.04 * 72 * scale;
  const badgeList = [];
  // Only add badges or placeholders for connector circles
  if (card.organism_type) badgeList.push({ type: 'functional', label: card.organism_type });
  const uniqueBiomes = Array.from(new Set(card.biomes || []));
  // Deduplicate by badge key, but preserve order so the top badge is the first biome in the card data
  // For biomes, add one badge/connector per entry in card.biomes, preserving order
  const { badgeMap } = require('./badges/biomes-badge');
  for (const b of card.biomes || []) {
    badgeList.push({ type: 'biome', label: b });
  }
  if (card.trophic_level) {
    let trophicLabel = card.trophic_level.replace(/\s*\(.*?\)/, '');
    badgeList.push({ type: 'trophic', label: trophicLabel });
  }
  if (card.eras && card.eras.length) {
    card.eras.forEach(e => badgeList.push({ type: 'era', label: e }));
  }
  if (card.periods && card.periods.length) {
    // Only add unique period badges, preserving order
    const seenPeriods = new Set();
    for (const p of card.periods) {
      if (!seenPeriods.has(p)) {
        badgeList.push({ type: 'period', label: p });
        seenPeriods.add(p);
      }
    }
  }
  const dynamicBadgeColumnHeight = badgeList.length * badgeRadius * 2 + (badgeList.length - 1) * badgeGap;
  let badgeY = contentY + (contentH - dynamicBadgeColumnHeight) / 2 + badgeRadius + 60;
  const drawBiomesBadge = require('./badges/biomes-badge');
  const drawTrophicLevelBadge = require('./badges/trophic-level-badge');
  const drawErasBadge = require('./badges/eras-badge');
  const drawPeriodsBadge = require('./badges/periods-badge');
  // Ensure neonColor is always defined for badge rendering
  const { CATEGORY_COLORS } = require('./layers/title-color-block');
  const category = card.organism_type;
  const neonColor = card.neonColor || CATEGORY_COLORS[category] || '#02BDF2';
  // Draw all biome badges after other elements to ensure top z-index
  for (let i = 0; i < badgeList.length; i++) {
    let fieldY = badgeY + i * (badgeRadius * 2 + badgeGap);
    const badge = badgeList[i];
    if (badge.type === 'biome') {
      // Render only the badge for this biome, not all biomes
      await drawBiomesBadge(ctx, badgeStartX, fieldY, badgeRadius, { ...card, biomes: [badge.label] }, scale, neonColor);
    }
  }
  // Only draw badges that are attached to connector lines
  for (let i = 0; i < badgeList.length; i++) {
    let fieldY = badgeY + i * (badgeRadius * 2 + badgeGap);
    const badge = badgeList[i];
    // Move trophic badge rendering after connector for highest z-index
    if (badge.type === 'era') {
      await drawErasBadge(ctx, badgeStartX, fieldY, badgeRadius, card, scale, neonColor);
    }
    if (badge.type === 'period') {
      await drawPeriodsBadge(ctx, badgeStartX, fieldY, badgeRadius, { ...card, periods: [badge.label] }, scale, neonColor);
    }
  }
  // Draw field backgrounds for the five fields first (transparent/opaque)
  // Draw field backgrounds and text with default composite mode
  drawFunctionalCategory(ctx, contentX + 20, contentY + 40, contentW, contentH, card, scale);
  drawBody(ctx, contentX + 20, contentY + 40, contentW, card, scale, { wrapText });
  // ...existing code...
  // Draw connector lines at the very end so nothing covers them
  for (let i = 0; i < badgeList.length; i++) {
    let fieldY = badgeY + i * (badgeRadius * 2 + badgeGap);
    const badge = badgeList[i];
    if (badge.type === 'functional') {
      let fieldIdx = 0;
      const fieldBlockY = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale) + fieldIdx * condensedRowH;
      const fieldTextY = fieldBlockY + Math.round(7 * scale) + 40;
      const label = 'Organism Type';
      ctx.save();
      ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
      const labelW = ctx.measureText(label).width;
      ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
      const value = (card.organism_type && (card.organism_type.match(/^(.*?)(\s*\(.*?\))?$/) || [null, card.organism_type])[1].trim()) || '';
      const valueW = ctx.measureText(value).width;
      const labelX = contentX + leftPadding + badgeRadius + badgeTextGap;
      const valueX = labelX;
      const minX = Math.min(labelX, valueX);
      const maxX = Math.max(labelX + labelW, valueX + valueW);
      const boxPadX = 4 * scale;
      // The background box for the field is drawn from (minX - boxPadX) to (maxX + boxPadX)
      // Extend connector 23px past the right edge of the background box
      const backgroundRightX = (maxX + boxPadX) + 23 * scale;
      ctx.restore();
      // Get neon color from title block color
      const { CATEGORY_COLORS } = require('./layers/title-color-block');
      const category = card.organism_type;
      const neonColor = CATEGORY_COLORS[category] || '#02BDF2';
      drawFunctionalCategoryConnector(ctx, badgeStartX, fieldY, labelX, fieldTextY, badgeRadius, scale, backgroundRightX, neonColor);
      await drawFunctionalCategoryBadge(ctx, badgeStartX, fieldY, badgeRadius, card, scale, neonColor);
    }
    if (badge.type === 'biome') {
      let fieldIdx = 1;
      const fieldBlockY = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale) + fieldIdx * condensedRowH;
      const fieldTextY = fieldBlockY + Math.round(7 * scale) + 40;
      const label = 'Biomes';
      ctx.save();
      ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
      const labelW = ctx.measureText(label).width;
      ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
      const value = card.biomes ? card.biomes.join(', ') : '';
      const valueW = ctx.measureText(value).width;
      const labelX = contentX + leftPadding + badgeRadius + badgeTextGap;
      const valueX = labelX;
      const minX = Math.min(labelX, valueX);
      const maxX = Math.max(labelX + labelW, valueX + valueW);
      const boxPadX = 4 * scale;
      const backgroundRightX = (maxX + boxPadX) + 23 * scale;
      ctx.restore();
      drawBiomesConnector(ctx, badgeStartX, fieldY, labelX, fieldTextY, badgeRadius, scale, backgroundRightX, neonColor);
    }
    if (badge.type === 'trophic') {
      let fieldIdx = 2;
      const fieldBlockY = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale) + fieldIdx * condensedRowH;
      const fieldTextY = fieldBlockY + Math.round(7 * scale) + 40;
      const label = 'Trophic Level';
      ctx.save();
      ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
      const labelW = ctx.measureText(label).width;
      ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
      const matchTrophic = card.trophic_level ? card.trophic_level.match(/^(.*?)(\s*\((.*?)\))?$/) : null;
      const rawValue = matchTrophic ? matchTrophic[1] : (card.trophic_level || '');
      const value = rawValue.replace(/\b([a-z])/g, c => c.toUpperCase());
      const valueW = ctx.measureText(value).width;
      const labelX = contentX + leftPadding + badgeRadius + badgeTextGap;
      const valueX = labelX;
      const minX = Math.min(labelX, valueX);
      const maxX = Math.max(labelX + labelW, valueX + valueW);
      const boxPadX = 4 * scale;
      const backgroundRightX = (maxX + boxPadX) + 23 * scale;
      ctx.restore();
      const drawTrophicLevelConnector = require('./connectors/trophic-level-connector');
      // Draw connector first
      drawTrophicLevelConnector(ctx, badgeStartX, fieldY, labelX - 18 * scale, fieldTextY, badgeRadius, scale, backgroundRightX, neonColor);
      // Draw badge after connector for highest z-index
      await drawTrophicLevelBadge(ctx, badgeStartX, fieldY, badgeRadius, card, scale, neonColor);
    }
    if (badge.type === 'era') {
      let fieldIdx = 3;
      const fieldBlockY = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale) + fieldIdx * condensedRowH;
      const fieldTextY = fieldBlockY + Math.round(7 * scale) + 40;
      const label = 'Eras';
      ctx.save();
      ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
      const labelW = ctx.measureText(label).width;
      ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
      const value = card.eras ? card.eras.join(', ') : '';
      const valueW = ctx.measureText(value).width;
      const labelX = contentX + leftPadding + badgeRadius + badgeTextGap;
      const valueX = labelX;
      const minX = Math.min(labelX, valueX);
      const maxX = Math.max(labelX + labelW, valueX + valueW);
      const boxPadX = 4 * scale;
      const backgroundRightX = (maxX + boxPadX) + 23 * scale;
      ctx.restore();
      const drawErasConnector = require('./connectors/eras-connector');
      // Restore previous connector placement for eras
      drawErasConnector(ctx, badgeStartX, fieldY, labelX - 18 * scale, fieldTextY, badgeRadius, scale, backgroundRightX, neonColor);
    }
    if (badge.type === 'period') {
      let fieldIdx = 4;
      const fieldBlockY = contentY + contentH - blockHeight - bottomPadding + Math.round(8 * scale) + fieldIdx * condensedRowH;
      const fieldTextY = fieldBlockY + Math.round(7 * scale) + 40;
      const label = 'Periods';
      ctx.save();
      ctx.font = `bold ${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
      const labelW = ctx.measureText(label).width;
      ctx.font = `${Math.round(6 * scale)}px "DejaVu Sans", sans-serif`;
      const value = card.periods ? card.periods.join(', ') : '';
      const valueW = ctx.measureText(value).width;
      const labelX = contentX + leftPadding + badgeRadius + badgeTextGap;
      const valueX = labelX;
      const minX = Math.min(labelX, valueX);
      const maxX = Math.max(labelX + labelW, valueX + valueW);
      const boxPadX = 4 * scale;
      const backgroundRightX = (maxX + boxPadX) + 23 * scale;
      ctx.restore();
      const drawPeriodsConnector = require('./connectors/periods-connector');
      drawPeriodsConnector(ctx, badgeStartX, fieldY, labelX, fieldTextY, badgeRadius, scale, backgroundRightX, neonColor);
    }
  }
  // Title must always be positioned above the color block, at this fixed offset.
  // Do not change its position elsewhere in the codebase.
  drawTitle(ctx, contentX, contentY - 30, contentW, card, scale);
  // Move all text except title and card number down by 40px
  drawFunctionalCategory(ctx, contentX + 20, contentY + 40, contentW, contentH, card, scale);
  drawBody(ctx, contentX + 20, contentY + 40, contentW, card, scale, { wrapText });
  drawCardNumber(ctx, safeX, safeY, card, scale);
  drawCorners(ctx, safeX, safeY, card, scale);
  // Draw trim outline (guide) last so it's on top.
  if (includeGuides) {
    drawTrim(ctx, safeX, safeY, scale, { roundedRectPath });
  }

  ctx.restore();
}

function layoutSheetPNG(cards, options = {}) {
  const dpi = options.dpi || 300;
  const includeGuides = options.includeGuides !== false;
  const { canvas, ctx, widthPx, heightPx, scale } = createCanvasInches(PAGE_W / INCH, PAGE_H / INCH, dpi);
  return {
    write: async (outPath) => {
      try {
        // Center grid
        const gridWpt = COLS * CARD_BLEED_W + (COLS - 1) * GAP_X;
        const gridHpt = ROWS * CARD_BLEED_H + (ROWS - 1) * GAP_Y;
        const startXpt = Math.max((PAGE_W - gridWpt) / 2, 0.5 * INCH);
        const startYpt = Math.max((PAGE_H - gridHpt) / 2, 0.5 * INCH);

        let idx = 0;
        // Background white
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
      } catch (e) {
        throw e;
      }
    }
  };
}

function layoutSinglePagesPNG(cards, options = {}) {
  const dpi = options.dpi || 300;
  const includeGuides = options.includeGuides !== false;
  return {
    write: async (outPath) => {
      const rows = cards.length;
      const dims = createCanvasInches(CARD_BLEED_W / INCH, CARD_BLEED_H / INCH, dpi);
      const cardW = dims.widthPx;
      const cardH = dims.heightPx;
      const scale = dims.scale;
      const { createCanvas } = require('@napi-rs/canvas');
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
    }
  };
}

async function writeSingleCardPNG(card, outPath, options = {}) {
  const dpi = options.dpi || 300;
  const includeGuides = options.includeGuides !== false;
  const { canvas, ctx, scale } = createCanvasInches(CARD_BLEED_W / INCH, CARD_BLEED_H / INCH, dpi);
  await drawCardPNG(ctx, 0, 0, card, scale, { includeGuides: false });
  if (includeGuides) {
    drawCardGuides(ctx, 0, 0, scale);
  }
  writeCanvasPNG(canvas, outPath, dpi);
}

function getEachCardBaseName(card, options = {}) {
  let baseName = (card.fileName && card.fileName.replace(/\.png$/, ''))
    || (options.fileName && options.fileName.replace(/\.png$/, ''))
    || `Organism-Plant-${(card.id || card.title || 'card')}`;

  return baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
}

async function writeEachCardPNG(cards, outDir, options = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const dpi = options.dpi || 300;
  const includeGuides = options.includeGuides !== false;
  const gapPt = options.gapPt != null ? options.gapPt : (0.5 * INCH);
  try {
    for (const card of cards) {
      const baseName = getEachCardBaseName(card, options);
      const filePath = path.resolve(outDir, `${baseName}.png`);
      try {
        await writeFrontBackPairPNG({
          card,
          outPath: filePath,
          dpi,
          gapPt,
          includeGuides,
          drawFront: async (ctx, xPt, yPt, cardData, scale) => {
            await drawCardPNG(ctx, xPt, yPt, cardData, scale, { includeGuides: false });
          },
        });
      } catch (err) {
        console.error('Failed to write PNG:', {
          filePath,
          card,
          error: err && err.message ? err.message : err
        });
        throw err;
      }
    }
  } catch (e) {
    console.error('Error in writeEachCardPNG:', e);
    throw e;
  }
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

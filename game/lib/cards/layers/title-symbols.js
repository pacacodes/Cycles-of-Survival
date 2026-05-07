function hexToRgba(hex, alpha) {
  const clean = String(hex || '').replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatInputValue(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return '0';
  if (n > 0) return `+${n}`;
  return String(n);
}

function drawSplitBackground(ctx, rx, ry, rw, rh, radius, color, topOpacity, bottomOpacity, scale = 1, splitRatio = 0.56) {
  ctx.save();

  const splitY = ry + rh * splitRatio;

  ctx.beginPath();
  ctx.moveTo(rx + radius, ry);
  ctx.lineTo(rx + rw - radius, ry);
  ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
  ctx.lineTo(rx + rw, splitY);
  ctx.lineTo(rx, splitY);
  ctx.lineTo(rx, ry + radius);
  ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, topOpacity);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(rx, splitY);
  ctx.lineTo(rx + rw, splitY);
  ctx.lineTo(rx + rw, ry + rh - radius);
  ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
  ctx.lineTo(rx + radius, ry + rh);
  ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
  ctx.lineTo(rx, splitY);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, bottomOpacity);
  ctx.fill();

  const lineStartX = rx;
  const lineEndX = rx + rw;
  const lineY = splitY - 4;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.45;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10 * scale;
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(lineStartX, lineY);
  ctx.lineTo(lineEndX, lineY);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
  ctx.lineWidth = 0.7 * scale;
  ctx.beginPath();
  ctx.moveTo(lineStartX, lineY);
  ctx.lineTo(lineEndX, lineY);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.shadowBlur = 1.5 * scale;
  ctx.lineWidth = 0.45 * scale;
  ctx.beginPath();
  ctx.moveTo(lineStartX, lineY);
  ctx.lineTo(lineEndX, lineY);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawPawSymbol(ctx, centerX, centerY, size) {
  const toeRx = size * 0.088;
  const toeRy = size * 0.125;
  const padW = size * 0.54;
  const padH = size * 0.34;
  const toeY = centerY - size * 0.24;
  const toeStep = size * 0.23;
  const outerToeOffset = toeStep * 1.5;
  const innerToeOffset = toeStep * 0.5;

  ctx.beginPath();
  ctx.ellipse(centerX - outerToeOffset, toeY + size * 0.10, toeRx, toeRy, 0, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(centerX - innerToeOffset, toeY - size * 0.08, toeRx, toeRy, 0, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(centerX + innerToeOffset, toeY - size * 0.08, toeRx, toeRy, 0, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(centerX + outerToeOffset, toeY + size * 0.10, toeRx, toeRy, 0, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  const padY = centerY + size * 0.12;
  const topY = padY - padH * 0.52;
  const leftX = centerX - padW * 0.48;
  const rightX = centerX + padW * 0.48;
  const bottomY = padY + padH * 0.56;

  ctx.moveTo(centerX, topY);
  ctx.bezierCurveTo(
    centerX + padW * 0.24, padY - padH * 0.46,
    rightX, padY - padH * 0.04,
    rightX, padY + padH * 0.24
  );
  ctx.bezierCurveTo(
    rightX, padY + padH * 0.46,
    centerX + padW * 0.20, bottomY,
    centerX, bottomY
  );
  ctx.bezierCurveTo(
    centerX - padW * 0.20, bottomY,
    leftX, padY + padH * 0.46,
    leftX, padY + padH * 0.24
  );
  ctx.bezierCurveTo(
    leftX, padY - padH * 0.04,
    centerX - padW * 0.24, padY - padH * 0.46,
    centerX, topY
  );
  ctx.closePath();
  ctx.fill();
}

function drawWaterDropSymbol(ctx, centerX, centerY, size) {
  const dropH = size * 0.95;
  const dropW = size * 0.65;
  
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - dropH * 0.5);
  ctx.bezierCurveTo(
    centerX - dropW * 0.5, centerY - dropH * 0.3,
    centerX - dropW * 0.5, centerY + dropH * 0.2,
    centerX, centerY + dropH * 0.5
  );
  ctx.bezierCurveTo(
    centerX + dropW * 0.5, centerY + dropH * 0.2,
    centerX + dropW * 0.5, centerY - dropH * 0.3,
    centerX, centerY - dropH * 0.5
  );
  ctx.closePath();
  ctx.fill();
}

function drawTopSymbols(ctx, x, y, scale, card = {}) {
  const symbolFontSize = Math.round(4 * scale);
  const inputFontSize = Math.round(4 * scale);
  const inputFont = `${inputFontSize}px "DejaVu Sans", sans-serif`;
  const symbolColor = '#000000';
  const symbolBgColor = '#F7B733';
  const topOpacity = 0.62;
  const bottomOpacity = 0.92;
  const splitRatio = 0.52;
  const effects = card.effects || {};
  const waterReq = card.waterRequirement !== undefined ? card.waterRequirement : 0;

  ctx.save();
  ctx.font = `bold ${symbolFontSize}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const boxPadX = 3 * scale;
  const boxRadius = 3 * scale;
  const badgeGap = Math.round(2 * scale);
  const badgeHeight = Math.round(14 * scale);
  const topSectionHeight = Math.round(badgeHeight * splitRatio);
  const symbolSize = Math.round(symbolFontSize * 1.2 * 0.95);

  const inputValues = [
    formatInputValue(effects.oxygen),
    formatInputValue(effects.co2),
    formatInputValue(waterReq)
  ];

  const badges = [
    { kind: 'text', symbol: 'O₂', value: inputValues[0] },
    { kind: 'text', symbol: 'CO₂', value: inputValues[1] },
    { kind: 'water', symbol: '', value: inputValues[2] }
  ];

  let sharedInnerWidth = 8 * scale;
  for (const badge of badges) {
    if (badge.kind === 'text') {
      ctx.font = `bold ${symbolFontSize}px "DejaVu Sans", sans-serif`;
      sharedInnerWidth = Math.max(sharedInnerWidth, ctx.measureText(badge.symbol).width);
    }
    ctx.font = inputFont;
    sharedInnerWidth = Math.max(sharedInnerWidth, ctx.measureText(badge.value).width);
  }

  const badgeRects = [];
  let nextX = x;

  for (const badge of badges) {
    const badgeWidth = sharedInnerWidth + boxPadX * 2;
    badgeRects.push({
      ...badge,
      rx: nextX,
      ry: y,
      rw: badgeWidth,
      rh: badgeHeight
    });
    nextX += badgeWidth + badgeGap;
  }

  for (const rect of badgeRects) {
    drawSplitBackground(ctx, rect.rx, rect.ry, rect.rw, rect.rh, boxRadius, symbolBgColor, topOpacity, bottomOpacity, scale, splitRatio);
  }

  ctx.fillStyle = symbolColor;
  for (const rect of badgeRects) {
    const centerX = rect.rx + rect.rw / 2;
    const topCenterY = rect.ry + topSectionHeight / 2;
    
    if (rect.kind === 'water') {
      drawWaterDropSymbol(ctx, centerX, topCenterY, symbolSize);
    } else {
      ctx.font = `bold ${symbolFontSize}px "DejaVu Sans", sans-serif`;
      ctx.fillText(rect.symbol, centerX, topCenterY);
    }

    const bottomCenterY = rect.ry + topSectionHeight + (rect.rh - topSectionHeight) / 2;
    ctx.font = inputFont;
    ctx.fillText(rect.value, centerX, bottomCenterY);
  }

  ctx.restore();
}

module.exports = function drawTitleSymbols(ctx, x, y, scale, card = {}) {
  const splitRatio = 0.52;
  const symbolFontSize = Math.round(5 * scale);
  const inputFontSize = Math.round(5 * scale);
  const inputFont = `${inputFontSize}px "DejaVu Sans", sans-serif`;
  const symbolY = y + Math.round(2 * scale);
  const symbolXBase = x + (100 * scale) - (10 * scale) - 80;
  const symbolColor = '#000000';
  const symbolBgColor = '#F7B733';
  const waterBgColor = '#3AD7F6';
  const topOpacity = 0.62;
  const bottomOpacity = 0.92;
  const effects = card.effects || {};

  ctx.save();
  ctx.font = `bold ${symbolFontSize}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const boxPadX = 4 * scale;
  const boxRadius = 4 * scale;
  const badgeGap = Math.round(3 * scale);
  const badgeHeight = Math.round(18 * scale);
  const topSectionHeight = Math.round(badgeHeight * splitRatio);
  const waterReq = card.waterRequirement !== undefined ? card.waterRequirement : 0;
  const inputValues = [
    formatInputValue(waterReq),
    formatInputValue(effects.oxygen),
    formatInputValue(effects.co2),
    formatInputValue(effects.biodiversity)
  ];

  const pawSize = Math.round(symbolFontSize * 1.35 * 0.95);

  const badges = [
    { kind: 'paw', symbol: '', value: inputValues[3] },
    { kind: 'text', symbol: 'O₂', value: inputValues[1] },
    { kind: 'text', symbol: 'CO₂', value: inputValues[2] },
    { kind: 'text', symbol: 'H₂O', value: inputValues[0] }
  ];

  let sharedInnerWidth = 10 * scale;
  for (const badge of badges) {
    if (badge.kind === 'text') {
      ctx.font = `bold ${symbolFontSize}px "DejaVu Sans", sans-serif`;
      sharedInnerWidth = Math.max(sharedInnerWidth, ctx.measureText(badge.symbol).width);
    }
    ctx.font = inputFont;
    sharedInnerWidth = Math.max(sharedInnerWidth, ctx.measureText(badge.value).width);
  }

  const badgeRects = [];
  let nextX = symbolXBase;

  for (const badge of badges) {
    const badgeWidth = sharedInnerWidth + boxPadX * 2;

    badgeRects.push({
      ...badge,
      rx: nextX,
      ry: symbolY,
      rw: badgeWidth,
      rh: badgeHeight
    });

    nextX += badgeWidth + badgeGap;
  }

  for (const rect of badgeRects) {
    const bgColor = (rect.kind === 'text' && rect.symbol === 'H₂O') ? waterBgColor : symbolBgColor;
    drawSplitBackground(ctx, rect.rx, rect.ry, rect.rw, rect.rh, boxRadius, bgColor, topOpacity, bottomOpacity, scale, splitRatio);
  }

  ctx.fillStyle = symbolColor;
  for (const rect of badgeRects) {
    const centerX = rect.rx + rect.rw / 2;
    const topCenterY = rect.ry + topSectionHeight / 2;
    if (rect.kind === 'paw') {
      drawPawSymbol(ctx, centerX, topCenterY, pawSize);
    } else {
      ctx.font = `bold ${symbolFontSize}px "DejaVu Sans", sans-serif`;
      ctx.fillText(rect.symbol, centerX, topCenterY);
    }

    const bottomCenterY = rect.ry + topSectionHeight + (rect.rh - topSectionHeight) / 2;
    ctx.font = inputFont;
    ctx.fillText(rect.value, centerX, bottomCenterY);
  }

  ctx.restore();
};

module.exports.drawTopSymbols = drawTopSymbols;
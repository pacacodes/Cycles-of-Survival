module.exports = function drawEventBiomesConnector(ctx, badgeX, badgeY, fieldX, fieldY, badgeRadius, scale, backgroundRightX, neonColor) {
  ctx.save();
  const color = neonColor || '#02BDF2';

  // Circle ring
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.45;
  ctx.shadowColor = color;
  ctx.shadowBlur = 24 * scale;
  ctx.lineWidth = 3.2 * scale;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.1 * scale;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.shadowBlur = 2 * scale;
  ctx.lineWidth = 0.5 * scale;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

  // Connector line (halfway-left vertical segment)
  const startX = badgeX + badgeRadius;
  const startY = badgeY;
  const outLen = badgeRadius * 0.7;
  const shift = 18;
  // Midpoint between original biomes (+5) and role-style (-27): -11
  const vertX = startX + outLen + shift - 11;
  const radius = 15;
  const horizLen = Math.max(8 * scale, Math.abs(fieldX - vertX) * 0.22);
  const horizEndX = vertX + horizLen;
  let endX = horizEndX;
  if (backgroundRightX !== undefined && backgroundRightX !== null) {
    endX = backgroundRightX;
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.45;
  ctx.shadowColor = color;
  ctx.shadowBlur = 24 * scale;
  ctx.lineWidth = 2.2 * scale;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(vertX - radius, startY);
  ctx.arcTo(vertX, startY, vertX, fieldY, radius);
  ctx.lineTo(vertX, fieldY - radius);
  ctx.arcTo(vertX, fieldY, horizEndX, fieldY, radius);
  ctx.lineTo(endX, fieldY);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
  ctx.lineWidth = 0.7 * scale;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(vertX - radius, startY);
  ctx.arcTo(vertX, startY, vertX, fieldY, radius);
  ctx.lineTo(vertX, fieldY - radius);
  ctx.arcTo(vertX, fieldY, horizEndX, fieldY, radius);
  ctx.lineTo(endX, fieldY);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.shadowBlur = 2 * scale;
  ctx.lineWidth = 0.5 * scale;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(vertX - radius, startY);
  ctx.arcTo(vertX, startY, vertX, fieldY, radius);
  ctx.lineTo(vertX, fieldY - radius);
  ctx.arcTo(vertX, fieldY, horizEndX, fieldY, radius);
  ctx.lineTo(endX, fieldY);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
};

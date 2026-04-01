// Draw connector line for biomes badge to its field
module.exports = function drawBiomesConnector(ctx, badgeX, badgeY, fieldX, fieldY, badgeRadius, scale, backgroundRightX, neonColor) {
  ctx.save();
  // Use neonColor for connector and perimeter
  const color = neonColor || '#02BDF2';
  // Outer diffused neon glow
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
  // Crisp neon color
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.1 * scale;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
  // Center white highlight (diffused, less dominant)
  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.shadowBlur = 2 * scale;
  ctx.lineWidth = 0.5 * scale;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
  // Connector line: diffused neon glow
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.45;
  ctx.shadowColor = color;
  ctx.shadowBlur = 24 * scale;
  ctx.lineWidth = 2.2 * scale;
  ctx.beginPath();
  const startX = badgeX + badgeRadius;
  const startY = badgeY;
  const outLen = badgeRadius * 0.7;
  const shift = 18;
  const vertX = startX + outLen + shift + 5; // Move vertical segment 5px right
  const radius = 15;
  ctx.moveTo(startX, startY);
  ctx.lineTo(vertX - radius, startY);
  ctx.arcTo(vertX, startY, vertX, fieldY, radius);
  ctx.lineTo(vertX, fieldY - radius);
  const horizLen = Math.max(8 * scale, Math.abs(fieldX - vertX) * 0.22);
  const horizEndX = vertX + horizLen;
  ctx.arcTo(vertX, fieldY, horizEndX, fieldY, radius);
  let endX = horizEndX;
  if (backgroundRightX !== undefined && backgroundRightX !== null) {
    endX = backgroundRightX + 7;
  }
  ctx.lineTo(endX, fieldY);
  ctx.stroke();
  ctx.restore();
  // Connector line: crisp neon color
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
  // Connector line: center white highlight (diffused, less dominant)
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
}

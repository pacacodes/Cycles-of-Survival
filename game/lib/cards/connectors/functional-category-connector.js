// Draw connector line for functional category badge to its field
module.exports = function drawFunctionalCategoryConnector(ctx, badgeX, badgeY, fieldX, fieldY, badgeRadius, scale, backgroundRightX, neonColor) {
  ctx.save();
  // Draw three-layered neon effect for both circle and connector line
  // 1. OUTER DIFFUSED GLOWED COLOR LAYER (gentle lighting)
  ctx.save();
  ctx.strokeStyle = neonColor;
  ctx.globalAlpha = 0.45;
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 24 * scale;
  ctx.lineWidth = 3.2 * scale;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

  // 2. INNER COLOR LAYER (no glow, crisp)
  ctx.save();
  ctx.strokeStyle = neonColor;
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.1 * scale;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

  // 3. CENTER HIGHLIGHT (white, thinner, less dominant)
  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.shadowBlur = 2 * scale;
  ctx.lineWidth = 0.5 * scale;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

  // --- CONNECTOR LINE ---
  // 1. OUTER DIFFUSED GLOWED COLOR LAYER (gentle lighting)
  ctx.save();
  ctx.strokeStyle = neonColor;
  ctx.globalAlpha = 0.45;
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 24 * scale;
  ctx.lineWidth = 2.2 * scale;
  ctx.beginPath();
  const startX = badgeX + badgeRadius;
  const startY = badgeY;
  const fieldOffset = 4 * scale;
  const shift = 20;
  const vertX = fieldX - fieldOffset + shift - 15 + 5; // Move vertical segment 5px right
  const radius = 15;
  ctx.moveTo(startX, startY);
  ctx.lineTo(vertX - radius, startY);
  ctx.arcTo(vertX, startY, vertX, fieldY, radius);
  ctx.lineTo(vertX, fieldY - radius);
  const horizStartX = vertX + 15;
  ctx.arcTo(vertX, fieldY, horizStartX, fieldY, radius);
  let endX = horizStartX;
  if (backgroundRightX !== undefined && backgroundRightX !== null) {
    endX = backgroundRightX + 1.5 * scale;
  }
  ctx.lineTo(endX, fieldY);
  ctx.stroke();
  ctx.restore();

  // 2. INNER COLOR LAYER (no glow, crisp)
  ctx.save();
  ctx.strokeStyle = neonColor;
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
  ctx.lineWidth = 0.7 * scale;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(vertX - radius, startY);
  ctx.arcTo(vertX, startY, vertX, fieldY, radius);
  ctx.lineTo(vertX, fieldY - radius);
  ctx.arcTo(vertX, fieldY, horizStartX, fieldY, radius);
  ctx.lineTo(endX, fieldY);
  ctx.stroke();
  ctx.restore();

  // 3. CENTER HIGHLIGHT (white, thinner, less dominant)
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
  ctx.arcTo(vertX, fieldY, horizStartX, fieldY, radius);
  ctx.lineTo(endX, fieldY);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
};

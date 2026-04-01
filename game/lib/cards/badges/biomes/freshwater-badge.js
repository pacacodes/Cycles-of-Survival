// Freshwater biome badge generator for Cycles of Survival
// This is a placeholder. Update with actual badge rendering logic as needed.

module.exports = function freshwaterBadge(ctx, options = {}) {
  // Draw the Freshwater biome badge using the PNG image
  const { loadImage } = require('canvas');
  const path = require('path');
  const badgePath = path.join(__dirname, '../../layers/biomes/Fresh_Water.png');
  return loadImage(badgePath).then(image => {
    const x = options.x;
    const y = options.y;
    const radius = options.radius;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
  });
};

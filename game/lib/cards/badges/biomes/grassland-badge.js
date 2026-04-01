// Grassland biome badge generator for Cycles of Survival
const { loadImage } = require('canvas');
const path = require('path');
module.exports = async function grasslandBadge(ctx, options = {}) {
  const x = options.x;
  const y = options.y;
  const radius = options.radius;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();
  const imgPath = '/workspaces/Cycles-of-Survival/game/lib/cards/layers/biomes/Grassland.png';
  const grasslandImg = await loadImage(imgPath);
  ctx.drawImage(grasslandImg, x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
};
// Taiga biome badge generator for Cycles of Survival
// Placeholder: update with actual badge rendering logic as needed.

const { loadImage } = require('canvas');
const path = require('path');
module.exports = async function taigaBadge(ctx, options = {}) {
  const x = options.x;
  const y = options.y;
  const radius = options.radius;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();
  const imgPath = '/workspaces/ELPACA/game/lib/cards/layers/biomes/Taiga.png';
  const taigaImg = await loadImage(imgPath);
  ctx.drawImage(taigaImg, x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
};
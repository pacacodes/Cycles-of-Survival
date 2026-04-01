// Wetland biome badge generator for Cycles of Survival
// Placeholder: update with actual badge rendering logic as needed.

const { loadImage } = require('canvas');
const path = require('path');
module.exports = async function wetlandBadge(ctx, x, y, radius, card, scale) {
  // Support both (ctx, x, y, radius, card, scale) and (ctx, options)
  let _x = x, _y = y, _radius = radius;
  if (typeof x === 'object' && x !== null && 'x' in x) {
    const options = x;
    _x = options.x;
    _y = options.y;
    _radius = options.radius;
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(_x, _y, _radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();
  const imgPath = '/workspaces/Cycles-of-Survival/game/lib/cards/layers/biomes/Wetland.png';
  const wetlandImg = await loadImage(imgPath);
  ctx.drawImage(wetlandImg, _x - _radius, _y - _radius, _radius * 2, _radius * 2);
  ctx.restore();
};
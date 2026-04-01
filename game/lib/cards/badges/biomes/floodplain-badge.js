// Floodplain biome badge generator for Cycles of Survival
// This is a placeholder. Update with actual badge rendering logic as needed.

const { loadImage } = require('canvas');
const path = require('path');
module.exports = async function floodplainBadge(ctx, x, y, radius, card, scale) {
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
  ctx.fillStyle = '#A3CEF1'; // floodplain blue
  ctx.fill();
  ctx.restore();
  ctx.save();
  const imgPath = '/workspaces/ELPACA/game/lib/cards/layers/biomes/Floodplain.png';
  const floodplainImg = await loadImage(imgPath);
  const scaleDown = 0.91;
  const size = _radius * 2 * scaleDown;
  ctx.drawImage(floodplainImg, _x - size / 2, _y - size / 2, size, size);
  ctx.restore();
};

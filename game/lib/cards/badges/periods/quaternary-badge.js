const { loadImage } = require('canvas');
const path = require('path');
let quaternaryImg = null;
module.exports = async function quaternaryBadge(ctx, x, y, radius, card, scale) {
  ctx.save();
  // Draw circle background for badge
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#B3C6E7'; // example color for Quaternary
  ctx.fill();
  ctx.restore();
  // Draw PNG centered in badge circle at top z-index
  ctx.save();
  const imgPath = path.join(__dirname, 'Quaternary.png');
  if (!quaternaryImg) {
    quaternaryImg = await loadImage(imgPath);
  }
  const scaleDown = 0.91;
  const size = radius * 2 * scaleDown;
  ctx.drawImage(quaternaryImg, x - size / 2, y - size / 2, size, size);
  ctx.restore();
};

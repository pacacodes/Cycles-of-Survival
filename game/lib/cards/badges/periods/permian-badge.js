const { loadImage } = require('canvas');
const path = require('path');

module.exports = async function (ctx, x, y, radius, card, scale, neonColor) {
  ctx.save();
  const imgPath = path.join(__dirname, './Permian.png');
  const img = await loadImage(imgPath);
  const scaleDown = 0.95;
  const size = radius * 2 * scaleDown;
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size);

  const color = neonColor || '#02BDF2';
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.45;
  ctx.shadowColor = color;
  ctx.shadowBlur = 24 * scale;
  ctx.lineWidth = 3.2 * scale;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.1 * scale;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.shadowBlur = 2 * scale;
  ctx.lineWidth = 0.5 * scale;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
};
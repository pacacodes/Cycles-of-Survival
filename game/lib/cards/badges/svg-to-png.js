const sharp = require('sharp');
const fs = require('fs');

async function convertBadgeSVGtoPNG(svgPath, pngPath, size = 1024) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ quality: 100 })
    .toFile(pngPath);
  console.log('PNG badge written:', pngPath);
}

if (require.main === module) {
  const svgPath = process.argv[2] || 'desert-cactus-badge.svg';
  const pngPath = process.argv[3] || 'desert-cactus-badge.png';
  convertBadgeSVGtoPNG(svgPath, pngPath).catch(console.error);
}

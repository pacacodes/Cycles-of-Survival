const { loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = __dirname;
const FALLBACK_PHOTO = 'water background.png';

let photoIndexCache;

function getPhotoIndex() {
  if (photoIndexCache) return photoIndexCache;

  const index = new Map();
  for (const name of fs.readdirSync(PHOTO_DIR)) {
    const fullPath = path.join(PHOTO_DIR, name);
    let stats;
    try {
      stats = fs.statSync(fullPath);
    } catch (_) {
      continue;
    }
    if (!stats.isFile()) continue;
    index.set(name.toLowerCase(), fullPath);
  }

  photoIndexCache = index;
  return photoIndexCache;
}

function withExtensions(fileBase) {
  const noExt = fileBase.replace(/\.[^.]+$/, '');
  return [
    `${noExt}.png`,
    `${noExt}.jpg`,
    `${noExt}.jpeg`,
    `${noExt}.webp`,
  ];
}

function buildPhotoCandidates(card) {
  const explicit = (card && card.main_photo) || '';
  const scientific = (card && card.scientific_name) || '';
  const trimmedScientific = scientific.trim();
  const noTrailingDot = trimmedScientific.replace(/\.+$/, '');

  const candidates = [];
  if (explicit) candidates.push(explicit);
  if (trimmedScientific) {
    candidates.push(`${trimmedScientific}.png`);
    candidates.push(`${trimmedScientific.replace(/\s+/g, '_')}.png`);
  }
  if (noTrailingDot && noTrailingDot !== trimmedScientific) {
    candidates.push(`${noTrailingDot}.png`);
    candidates.push(`${noTrailingDot.replace(/\s+/g, '_')}.png`);
  }

  // Expand each candidate to common image extensions.
  const expanded = [];
  for (const c of candidates) {
    expanded.push(c);
    for (const extName of withExtensions(c)) {
      expanded.push(extName);
    }
  }

  const seen = new Set();
  return expanded.filter((name) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function resolvePhotoPath(card) {
  const index = getPhotoIndex();
  for (const candidate of buildPhotoCandidates(card)) {
    const hit = index.get(candidate.toLowerCase());
    if (hit) return hit;
  }

  return index.get(FALLBACK_PHOTO.toLowerCase()) || null;
}

module.exports = async function organismPhoto(ctx, x, y, { width, height, scale, card, photoScaleMultiplier = 1, photoFitMode = 'contain', flipHorizontal = false }) {
  ctx.save();
  const imgPath = resolvePhotoPath(card);

  if (imgPath) {
    try {
      const img = await loadImage(imgPath);
      // Fill the target area while preserving original image proportions.
      const colorBlockHeight = Math.round(72 * 0.5 + 20 + 20); // 0.5" in px + 40px extra
      const scaleFactor = photoScaleMultiplier;
      const targetW = width * scaleFactor;
      const targetH = (height - colorBlockHeight) * scaleFactor;
      const targetX = x + (width - targetW) / 2;
      const targetY = y + colorBlockHeight + 40;
      const fitScale = photoFitMode === 'contain'
        ? Math.min(targetW / img.width, targetH / img.height)
        : Math.max(targetW / img.width, targetH / img.height);
      const drawW = img.width * fitScale;
      const drawH = img.height * fitScale;
      const drawX = targetX + (targetW - drawW) / 2;
      const drawY = targetY + (targetH - drawH) / 2;
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.rect(targetX, targetY, targetW, targetH);
      ctx.clip();
      if (flipHorizontal) {
        ctx.translate(drawX + drawW, drawY);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, drawW, drawH);
      } else {
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }
    } catch (err) {
      // Keep card generation resilient if a configured image is missing.
    }
  }
  ctx.restore();
};

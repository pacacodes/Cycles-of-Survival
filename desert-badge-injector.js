// desert-badge-injector.js
// Script to inject the provided desert badge PNG into every card with a placeholder desert badge.
// Usage: node desert-badge-injector.js

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { compositeBadgeOnCard } = require('./game/lib/cards/helpers/cropmarks'); // hypothetical helper

// Path to the badge image (update if needed)
const BADGE_PATH = path.resolve(__dirname, 'desert-badge.png');
// Directory containing card PNGs
const CARDS_DIR = path.resolve(__dirname, 'output/cards');

// Load badge PNG
function loadBadge() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(BADGE_PATH)
      .pipe(new PNG())
      .on('parsed', function () {
        resolve(this);
      })
      .on('error', reject);
  });
}

// Find all card PNGs with a placeholder desert badge
function findDesertCards() {
  return fs.readdirSync(CARDS_DIR)
    .filter(file => file.endsWith('.png'))
    .filter(file => file.includes('desert-placeholder')); // adjust pattern as needed
}

// Composite badge onto card
async function injectBadge() {
  const badge = await loadBadge();
  const cards = findDesertCards();

  for (const cardFile of cards) {
    const cardPath = path.join(CARDS_DIR, cardFile);
    const card = await new Promise((resolve, reject) => {
      fs.createReadStream(cardPath)
        .pipe(new PNG())
        .on('parsed', function () {
          resolve(this);
        })
        .on('error', reject);
    });

    // Scale badge to fit inside neon perimeter circle
    // (Assume circle is at center, radius known; adjust as needed)
    const circleRadius = Math.min(card.width, card.height) * 0.22; // example
    const badgeScale = circleRadius * 2 / Math.max(badge.width, badge.height);
    // Resize badge (implement resize logic or use a library)
    // Place badge at center
    // Composite badge onto card
    // (Replace with actual compositing logic)
    compositeBadgeOnCard(card, badge, badgeScale);

    // Save new card
    card.pack().pipe(fs.createWriteStream(cardPath.replace('.png', '-with-desert.png')));
    console.log(`Injected badge into ${cardFile}`);
  }
}

injectBadge().catch(console.error);

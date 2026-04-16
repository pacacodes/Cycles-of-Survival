const { loadImage } = require('canvas');
const path = require('path');

const categoryBadgeImageMap = {
  // New taxonomy keys
  microbes:                  path.join(__dirname, '../layers/detailed-type/category/Microbes_Early_Life.png'),
  algaeandphytoplankton:     path.join(__dirname, '../layers/detailed-type/category/Plants_Algae.png'),
  aquaticplants:             path.join(__dirname, '../layers/detailed-type/category/Plants_Algae.png'),
  aquaticinvertebrates:      path.join(__dirname, '../layers/detailed-type/category/Aquatic_Reef_Invertebrate.png'),
  aquaticvertebrates:        path.join(__dirname, '../layers/detailed-type/category/Aquatic_Vertebrates.png'),
  fungi:                     path.join(__dirname, '../layers/detailed-type/category/Microbes_Early_Life.png'),
  plants:                    path.join(__dirname, '../layers/detailed-type/category/Plants_Algae.png'),
  terrestrialinvertebrates:  path.join(__dirname, '../layers/detailed-type/category/Terrestrial_Invertebrates.png'),
  terrestrialvertebrates:    path.join(__dirname, '../layers/detailed-type/category/Terrestrial_Vertebrates.png'),
  decomposersanddetritivores: path.join(__dirname, '../layers/detailed-type/category/Microbes_Early_Life.png'),
  // Legacy keys
  plantsalgae:               path.join(__dirname, '../layers/detailed-type/category/Plants_Algae.png'),
  microbesearlylife:         path.join(__dirname, '../layers/detailed-type/category/Microbes_Early_Life.png'),
  aquaticreefinvertebrates:  path.join(__dirname, '../layers/detailed-type/category/Aquatic_Reef_Invertebrate.png'),
  mammals:                   path.join(__dirname, '../layers/detailed-type/category/Mammals.png'),
  dinosaursbirds:            path.join(__dirname, '../layers/detailed-type/category/Dinosaur_Bird.png'),
  terrestrialinvertebratesincludinglichensfungiguildcards: path.join(__dirname, '../layers/detailed-type/category/Terrestrial_Invertebrates.png'),
  terrestrialvertebratesamphibiansreptiles: path.join(__dirname, '../layers/detailed-type/category/Terrestrial_Vertebrates.png'),
};

const categoryBadgeScaleMap = {
  terrestrialvertebrates: 1.05,
  terrestrialinvertebrates: 1.05,
  // Legacy
  mammals: 1.05,
  dinosaursbirds: 1.05,
  terrestrialvertebratesamphibiansreptiles: 1.05,
};

module.exports = function drawFunctionalCategoryBadge(ctx, x, y, radius, card, scale, neonColor) {
  ctx.save();
  // Use neonColor for perimeter
  const color = neonColor || (() => {
    const { CATEGORY_COLORS } = require('../layers/title-color-block');
    const category = card.organism_type || card.organism_type;
    return CATEGORY_COLORS[category] || '#02BDF2';
  })();
  // Outer diffused neon glow
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
  // Crisp neon color
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.1 * scale;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
  // Center white highlight (diffused, less dominant)
  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.shadowBlur = 2 * scale;
  ctx.lineWidth = 0.5 * scale;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

  const category = card && (card.organism_type || card.organism_type);
  const normalizedCategory = (category || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const badgeImagePath = categoryBadgeImageMap[normalizedCategory];

  if (badgeImagePath) {
    return loadImage(badgeImagePath)
      .then((badgeImage) => {
        const baseIconRadius = radius * 0.945945;
        const iconScale = categoryBadgeScaleMap[normalizedCategory] || 1;
        const iconRadius = baseIconRadius * iconScale;
        const imageWidth = badgeImage.width || 1;
        const imageHeight = badgeImage.height || 1;
        const imageAspect = imageWidth / imageHeight;

        let drawWidth = iconRadius * 2;
        let drawHeight = iconRadius * 2;
        if (imageAspect > 1) {
          drawHeight = drawWidth / imageAspect;
        } else if (imageAspect < 1) {
          drawWidth = drawHeight * imageAspect;
        }

        const drawX = x - drawWidth / 2;
        const drawY = y - drawHeight / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, iconRadius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(badgeImage, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      })
      .catch(() => undefined);
  }

  // Removed subtle dark fill to eliminate unwanted circle
};
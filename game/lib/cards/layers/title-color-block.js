// Title Color Block Layer for Cards
// Draws a color block at the top of the card based on functional category


// Example color mapping for functional categories
const CATEGORY_COLORS = {
                  'Aquatic Vertebrates': '#02BDF2', // Bright blue
                'Plants & Algae': '#9ECD8F', // Soft green
              'Producers': '#A4F9CC', // Mint green
            'Microbes & Early Life': '#4D985E', // Deep green
          'Aquatic & Reef Invertebrates': '#3AD7F6', // Cyan
        'Terrestrial Invertebrates (including lichens/fungi guild cards)': '#FFD93D', // Bright yellow
      'Terrestrial Invertebrates': '#FFD93D', // Bright yellow
    'Mammals': '#FF7F6E', // Coral
  'Dinosaurs & Birds': '#E6501B', // Red-orange
  'Terrestrial Vertebrates (Amphibians & Reptiles)': '#F28C28', // Tangerine
  // Add more categories/colors as needed
};

/**
 * Draws the title color block layer
 * @param {object} ctx - CanvasRenderingContext2D
 * @param {object} card - Card data object
 * @param {object} layout - Layout info (width, height, dpi, etc.)
 */
function drawTitleColorBlock(ctx, card, layout) {
  let blockHeight = layout.dpi * 0.5; // 0.5 inch in pixels
  blockHeight += 20; // Make the color block taller by 20px
  blockHeight += 20; // Make the color block even taller by another 20px
  // Support both camelCase and snake_case for functional category
  const category = card.organism_type || card.organism_type;
  const color = CATEGORY_COLORS[category] || '#CCCCCC'; // Default gray

  const offsetX = 0;
  const offsetY = 0;

  ctx.save();
  ctx.globalAlpha = 1.0; // Ensure fully opaque
  ctx.fillStyle = color;
  // Draw from the card's local origin; caller controls whether width is trim or bleed.
  ctx.fillRect(offsetX, offsetY, layout.width, blockHeight);
  ctx.restore();
}

module.exports = {
  drawTitleColorBlock,
  CATEGORY_COLORS,
};

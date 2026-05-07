// Title Color Block Layer for Cards
// Draws a color block at the top of the card based on functional category


// Example color mapping for functional categories
const CATEGORY_COLORS = {
  // New taxonomy (sub-category labels)
  'Microbes':                    '#4D985E', // Deep green
  'Algae and phytoplankton':     '#2DB89A', // Teal
  'Aquatic plants':              '#6DC072', // Medium green
  'Aquatic invertebrates':       '#03fcf8', // Cyan (was bright cyan, swapped with H2O)
  'Aquatic vertebrates':         '#02BDF2', // Bright blue
  'Fungi':                       '#D4813A', // Earthy amber
  'Plants':                      '#9ECD8F', // Soft green
  'Terrestrial invertebrates':   '#FFD93D', // Bright yellow
  'Terrestrial vertebrates':     '#FF7F6E', // Coral (same as Mammals)
  // Legacy keys (backward compat)
  'Aquatic Vertebrates': '#02BDF2',
  'Plants & Algae': '#9ECD8F',
  'Producers': '#A4F9CC',
  'Microbes & Early Life': '#4D985E',
  'Aquatic & Reef Invertebrates': '#3AD7F6',
  'Terrestrial Invertebrates (including lichens/fungi guild cards)': '#FFD93D',
  'Terrestrial Invertebrates': '#FFD93D',
  'Mammals': '#FF7F6E',
  'Dinosaurs & Birds': '#E6501B',
  'Terrestrial Vertebrates (Amphibians & Reptiles)': '#F28C28',
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
  const color = card.neonColor || CATEGORY_COLORS[category] || '#CCCCCC'; // Use neonColor if available (for event cards), otherwise lookup category

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

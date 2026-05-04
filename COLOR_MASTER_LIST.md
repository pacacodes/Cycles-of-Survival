# Master Color Palette - Cycles of Survival

## Summary
- **16 Unique Organism Card Colors**
- **3 Event Card Color Schemes** (neon + background + text)
- **Total: 19 Distinct Colors**

---

## ORGANISM CARD COLORS

### Primary Organism Categories (New Taxonomy)

| Color | Hex | Category | Usage | Notes |
|-------|-----|----------|-------|-------|
| Deep Green | #4D985E | Microbes | Title color block | Includes Microbes & Early Life |
| Teal | #2DB89A | Algae and phytoplankton | Title color block | Sea/freshwater algae |
| Medium Green | #6DC072 | Aquatic plants | Title color block | Water-based plants |
| Cyan | #3AD7F6 | Aquatic invertebrates | Title color block | Aquatic & Reef Invertebrates |
| Bright Blue | #02BDF2 | Aquatic vertebrates | Title color block | Fish, dolphins, etc. |
| Earthy Amber | #D4813A | Fungi | Title color block | Fungal organisms |
| Soft Green | #9ECD8F | Plants | Title color block | Terrestrial plants, Algae |
| Bright Yellow | #FFD93D | Terrestrial invertebrates | Title color block | Insects, spiders, etc. |
| Coral | #FF7F6E | Terrestrial vertebrates | Title color block | Mammals, Reptiles, Amphibians |
| Earthy Brown | #8B6914 | Decomposers & detritivores | Title color block | Soil organisms, scavengers |

### Legacy/Backward Compatibility Categories

| Color | Hex | Category | Notes |
|-------|-----|----------|-------|
| Bright Blue | #02BDF2 | Aquatic Vertebrates | Duplicate: used in legacy |
| Soft Green | #9ECD8F | Plants & Algae | Duplicate: used in legacy |
| Light Aqua Green | #A4F9CC | Producers | Early/alternative version |
| Deep Green | #4D985E | Microbes & Early Life | Duplicate: legacy name |
| Cyan | #3AD7F6 | Aquatic & Reef Invertebrates | Duplicate: legacy name |
| Bright Yellow | #FFD93D | Terrestrial Invertebrates (with lichens/fungi) | Duplicate: legacy name |
| Coral | #FF7F6E | Mammals | Duplicate: legacy name |
| Orange | #E6501B | Dinosaurs & Birds | Ancient organisms |
| Orange-Brown | #F28C28 | Terrestrial Vertebrates (Amphibians & Reptiles) | Legacy classification |

---

## EVENT CARD COLORS

### Crisis Cards
| Element | Hex | Color Name | Usage |
|---------|-----|-----------|-------|
| **Neon** | #9933FF | Purple | Title, type indicator, field headers |
| **Background** | #F8F0FF | Light Purple | Card background fill |
| **Title Text** | #000000 | Black | Event name, period |

### Recovery Cards
| Element | Hex | Color Name | Usage |
|---------|-----|-----------|-------|
| **Neon** | #22FF88 | Cyan-Green | Title, type indicator, field headers |
| **Background** | #F0FFF8 | Light Cyan-Green | Card background fill |
| **Title Text** | #000000 | Black | Event name, period |

### Mass Extinction Cards
| Element | Hex | Color Name | Usage |
|---------|-----|-----------|-------|
| **Neon** | #FF4444 | Red | Title, type indicator, field headers |
| **Background** | #FFF0F0 | Light Red | Card background fill |
| **Title Text** | #000000 | Black | Event name, period |

---

## COLOR DIFFERENTIATION STRATEGY

### By Hue Family

**Greens/Teals** (Organisms - natural/life):
- #4D985E - Deep Green (Microbes)
- #2DB89A - Teal (Algae)
- #6DC072 - Medium Green (Aquatic plants)
- #9ECD8F - Soft Green (Plants)
- #A4F9CC - Light Aqua Green (Producers - legacy)

**Blues** (Organisms - aquatic):
- #3AD7F6 - Cyan (Aquatic invertebrates)
- #02BDF2 - Bright Blue (Aquatic vertebrates)

**Yellows/Oranges** (Organisms - terrestrial active):
- #FFD93D - Bright Yellow (Terrestrial invertebrates)
- #E6501B - Orange (Dinosaurs & Birds)
- #F28C28 - Orange-Brown (Reptiles/Amphibians)

**Reds/Corals** (Organisms - warm):
- #FF7F6E - Coral (Terrestrial vertebrates/Mammals)
- #D4813A - Earthy Amber (Fungi)
- #8B6914 - Earthy Brown (Decomposers)

**Events - Bold/Saturated**:
- #9933FF - Purple (Crisis - Danger/Stress)
- #22FF88 - Cyan-Green (Recovery - Positive/Growth)
- #FF4444 - Red (Mass Extinction - Catastrophe)

---

## DESIGN RATIONALE

### Event Colors

1. **Crisis (Purple)**: Distinct from all organism colors; purple = tension/warning
2. **Recovery (Cyan-Green)**: Bright cyan-green provides visual contrast from organism greens while maintaining positive association
3. **Mass Extinction (Red)**: High saturation red = urgency/catastrophe; clearly distinct from coral organism color

### Why These Are Separate

- **Organism colors** use muted/natural tones reflecting their ecological role
- **Event colors** use bold/saturated tones for immediate impact and legibility on printed cards
- All event colors have dedicated background tints for accessibility

---

## Usage Guidelines

### Organism Cards
- Use CATEGORY_COLORS from `/game/lib/cards/layers/title-color-block.js`
- Colors appear in: title block, badges, connectors, neon borders
- Background is always white (#FFFFFF)

### Event Cards
- Use EVENT_TYPE_COLORS from `/game/lib/event-cards/color-scheme.js`
- Neon color: title, type indicator, field labels
- Background: colored (not white) for event type indication
- Title text: Black for contrast on colored backgrounds

---

## Files Using These Colors

### Organism Colors
- `game/lib/cards/layers/title-color-block.js` - Primary definition
- `game/lib/cards/helpers/draw-badge-connectors.js` - Badge coloring
- `game/lib/cards/layers/detailed-type/category/field-helpers.js` - Field coloring

### Event Colors
- `game/lib/event-cards/color-scheme.js` - Primary definition
- `game/lib/event-cards/layout-event-card.js` - Applied to card rendering

---

## Color Accessibility

All colors tested for:
- ✓ Sufficient contrast against black/white text
- ✓ Distinguishability for color-blind users
- ✓ Print reproduction at 300 DPI
- ✓ Web/screen display at various brightness levels

Recommended dark text (#000000) on:
- All light backgrounds
- All event card backgrounds

Recommended light text (#FFFFFF) for:
- On very dark backgrounds (not used in current design)

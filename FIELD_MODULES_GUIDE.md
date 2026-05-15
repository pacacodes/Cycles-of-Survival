# Event Card Field Modules - Architecture Guide

## Overview
Event card fields are now organized as modular, standalone components. Each field type has its own directory with separate files for drawing logic, backgrounds, and styling. This structure allows easy customization and movement of individual field elements without affecting others.

## Directory Structure

```
game/lib/event-cards/fields/
├── effect/
│   ├── index.js              # Main entry point
│   ├── draw.js               # Drawing logic for effect field
│   ├── background-top.js     # Top background shape
│   └── background-bottom.js  # Bottom background shape
├── biomes/
│   ├── index.js
│   ├── draw.js
│   ├── background-top.js
│   └── background-bottom.js
├── organisms/
│   ├── index.js
│   ├── draw.js
│   ├── background-top.js
│   └── background-bottom.js
└── periods/
    ├── index.js
    ├── draw.js
    ├── background-top.js
    └── background-bottom.js
```

## How Each Module Works

### index.js (Entry Point)
- Imports and coordinates all field components (draw.js, background-top.js, background-bottom.js)
- Exported as the main function to call for that field
- Example:
  ```javascript
  module.exports = function drawEffectFieldRow(ctx, opts) {
    return drawEffectField(ctx, {
      ...opts,
      drawTop: drawBackgroundTop,
      drawBottom: drawBackgroundBottom,
    });
  };
  ```

### draw.js (Main Drawing Logic)
- Contains the core drawing logic for the field
- Handles text rendering, label formatting, background drawing
- Returns `{ height: number }` for layout purposes
- Customization points:
  - `const displayLabel = 'EFFECT'` - Change field label
  - `boxPadX`, `boxPadY` - Adjust padding inside background box
  - `boxRadius` - Change rounded corner radius
  - `fieldSize`, `subSize` - Adjust text sizes

### background-top.js & background-bottom.js (Styling)
- Draw the split background effect (top half with one opacity, bottom half with another)
- Easy to customize:
  - Change `hexToRgba(color, opacity)` values to adjust transparency
  - Modify path commands for different shapes
  - Adjust `boxRadius` for corner roundedness

## Customization Examples

### Change Field Label Text
Edit the field's `draw.js`:
```javascript
// effect/draw.js
const displayLabel = 'EVENT IMPACT'; // Changed from 'EFFECT'
```

### Change Field Padding
Edit the field's `draw.js`:
```javascript
const boxPadX   = 6 * scale;  // Increased from 4 * scale
const boxPadY   = 3 * scale;  // Increased from 2 * scale
```

### Change Background Opacity
Edit the field's `draw.js`:
```javascript
drawTop(ctx, ..., 0.50);    // Changed from 0.45
drawBottom(ctx, ..., 0.90); // Changed from 0.80
```

### Move a Field to Different Position
In `functional-category-event.js`, the fields are drawn in order from bottom to top. Reorder the field processing to change layout:
```javascript
fields.forEach((field, i) => {
  // Fields are stacked from bottom up, first field drawn at bottom
  const fieldType = field.label ? field.label.toLowerCase() : 'effect';
  const drawer = fieldDrawers[fieldType] || drawEffectFieldRow;
  // ...
});
```

## Adding a New Field Type

1. Create new directory: `game/lib/event-cards/fields/new-field-name/`
2. Create 4 files:
   - `index.js` - Entry point (use existing field as template)
   - `draw.js` - Drawing logic (copy from `effect/draw.js`, modify)
   - `background-top.js` - Top background shape
   - `background-bottom.js` - Bottom background shape
3. Add import to `functional-category-event.js`:
   ```javascript
   const drawNewFieldRow = require('./fields/new-field-name');
   ```
4. Add to `fieldDrawers` object:
   ```javascript
   const fieldDrawers = {
     effect: drawEffectFieldRow,
     biomes: drawBiomesFieldRow,
     organisms: drawOrganismsFieldRow,
     periods: drawPeriodsFieldRow,
     'new-field': drawNewFieldRow,  // Add here
   };
   ```
5. Add field definition to `layout-event-card.js` in `getEventFieldDefinitions()`:
   ```javascript
   fields.push({
     label: 'New Field',
     main: 'Your value here',
     sub: 'Optional subtitle',
   });
   ```

## Configuration Standards

All fields follow these standards for consistency:

### Text Properties
- **fieldSize**: `Math.round(4.5 * scale)` - Main label and value text
- **subSize**: `Math.round(4.5 * scale)` - Subtitle text
- **Font**: `"DejaVu Sans"` for all text

### Box Properties
- **boxPadX**: `4 * scale` - Left/right padding
- **boxPadY**: `2 * scale` - Top/bottom padding
- **boxRadius**: `6 * scale` - Corner rounding
- **lineGap**: `Math.round(2 * scale)` - Space between label and subtitle

### Background Opacity
- **Top**: `0.45` - Upper half opacity
- **Bottom**: `0.80` - Lower half opacity

### Shadow Effects
- **shadowColor**: `'#FFFFFF'` - White shadow
- **shadowBlur**: `10 * scale` - Blur amount

## Positioning Strategy

Fields are positioned at the **bottom of the card** and stack upward:

1. Total height calculated by measuring all fields
2. Block Y position = `contentY + contentH - totalHeight - bottomPadding`
3. Fields drawn sequentially, each one positioned below the previous
4. This ensures consistent spacing regardless of field count or size variations

## Layout Parameters (from `functional-category-event.js`)

```javascript
badgeRadius   = 0.18 * 72 * scale;     // Badge size reference
badgeTextGap  = 10 * scale;             // Space between badge and text
leftPadding   = Math.round(21 * scale); // Left margin from card edge
bottomPadding = Math.round(6 * scale);  // Bottom margin from card edge
textX = contentX + leftPadding + badgeRadius + badgeTextGap; // Text start X
maxTextWidth  = contentW - (all margins); // Maximum text wrap width
```

## Testing Changes

After modifying any field:
```bash
npm run generate:event-cards -- --forceAll
```

View the generated cards in:
- `/workspaces/Cycles-of-Survival/Output/Event Cards/Crisis/`
- `/workspaces/Cycles-of-Survival/Output/Event Cards/Recovery/`
- `/workspaces/Cycles-of-Survival/Output/Event Cards/Mass Extinctions/`

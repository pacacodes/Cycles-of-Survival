# Event Cards Generator - Modular Structure

## Overview
The event cards generator is built with modular, single-responsibility JS files that mirror the organism card structure.

## Module Architecture

### Core Modules

#### `game/lib/event-cards/load-events.js`
**Responsibility:** Data loading

- `loadEvents(configPath)` - Load all events from config (crisis, recovery, extinction)
- `loadEventsByType(configPath, eventType)` - Load events filtered by type

```javascript
const { loadEvents } = require('./lib/event-cards/load-events');
const events = loadEvents('game/config/event-cards.json');
```

---

#### `game/lib/event-cards/color-scheme.js`
**Responsibility:** Visual theming

- `getEventColorScheme(eventType)` - Get colors for crisis/recovery/extinction
- Returns: `{ neon, background, titleText }`

Event type colors:
- **Crisis** → Purple (#9933FF) on light purple background
- **Recovery** → Cyan-Green (#22FF88) on light cyan-green background  
- **Mass Extinction** → Red (#FF4444) on light red background

---

#### `game/lib/event-cards/field-definitions.js`
**Responsibility:** Data transformation for display

- `formatBiomes(biomesBad, biomesGood)` - Add +/− indicators to biomes
- `formatOrganisms(organismsBad, organismsGood)` - Add +/− indicators to organisms
- `prepareEventForDisplay(event)` - Transform raw event to display-ready format
- `getEventCardFields()` - Define card field order and types

Key function:
```javascript
const formatted = prepareEventForDisplay(rawEvent);
// Returns: { id, name, type, effectText, biomes: [{name, indicator}], ... }
```

---

#### `game/lib/event-cards/manifest.js`
**Responsibility:** Caching & change detection

- `loadManifest(path)` - Load manifest from disk
- `saveManifest(path, data)` - Atomically save manifest
- `createEventSignature(event)` - Generate hash of event data
- `getManifestRecord(manifest, eventId)` - Retrieve cached entry

Prevents regenerating unchanged cards using signature-based caching.

---

#### `game/lib/event-cards/layout-event-card.js`
**Responsibility:** Single card rendering

- `drawEventCardPNG(ctx, x, y, event, scale, options)` - Draw one card
- `writeSingleEventCardPNG(outputPath, event, options)` - Save single card PNG
- `wrapAndDrawText(ctx, text, x, y, maxWidth, lineHeight)` - Text wrapping

Handles:
- Title with event name + period
- Effect text with word wrapping
- Biomes list with +/− indicators
- Organisms list with +/− indicators
- Global impact stats (CO₂, O₂, Biodiversity)

---

#### `game/lib/event-cards/layout-event-sheets.js`
**Responsibility:** Multi-card sheet layout

- `getSheetCount(cardCount)` - Calculate sheets needed (3×2 = 6 cards/sheet)
- `writeEventSheetsPNG(outputPath, events, options)` - Generate sheets
- `getCardPosition(cardIndex)` - Calculate card position on sheet
- `getSheetDimensions()` - Return US Letter + card layout size

Layout: **3 columns × 2 rows per US Letter page**

---

### Main Entry Point

#### `game/generate-event-cards.js`
**Responsibility:** Orchestration & CLI

Main CLI script that:
1. Parses command-line arguments
2. Loads events from config
3. Prepares events for display
4. Checks manifest for changes
5. Generates PNG cards (individual or sheets)
6. Manages output directory structure
7. Saves updated manifest

**Command-line options:**
```bash
--config <path>      Event config file (default: game/config/event-cards.json)
--outDir <path>      Output directory (default: output/Event Cards)
--safeDir <path>     Backup directory (default: saved_files/Event Cards)
--type <type>        Filter by type: crisis, recovery, mass_extinction
--format <format>    Output format: each, sheet, both (default: each)
--dpi <number>       DPI for PNG generation (default: 300)
--open               Open generated PNGs after creation
--forceAll           Regenerate all cards (ignore cache)
```

---

## NPM Scripts

```bash
# Generate all event cards (individual PNGs)
npm run generate:event-cards

# Generate only individual cards
npm run generate:event-cards:each

# Generate only sheet layouts
npm run generate:event-cards:sheet

# Generate both individual and sheets
npm run generate:event-cards:both

# Generate by event type
npm run generate:event-cards:crisis
npm run generate:event-cards:recovery
npm run generate:event-cards:extinction

# Watch for config changes
npm run watch:event-cards
```

---

## Output Structure

```
output/Event Cards/
├── Crisis/
│   ├── .manifest.json
│   ├── 001-prolonged-drought.png
│   ├── 002-megaflood.png
│   └── ...
├── Recovery/
│   ├── .manifest.json
│   ├── 001-new-colonization-wave.png
│   └── ...
└── Mass Extinctions/
    ├── .manifest.json
    ├── 001-end-ordovician-mass-extinction.png
    └── ...
```

---

## Card Layout

Each event card shows:

1. **Title Area**
   - Event name + period (e.g., "Prolonged Drought (Event Card)")
   - Event type indicator (CRISIS, RECOVERY, MASS_EXTINCTION)

2. **Effect Section**
   - effectText with word wrapping

3. **Biomes Affected**
   - List with +/− indicators
   - Limited to 4 visible entries

4. **Organisms Affected**
   - Group name with example species
   - +/− indicators
   - Limited to 4 visible entries

5. **Global Impact Stats**
   - CO₂ change: +1, 0, -1, etc.
   - O₂ change
   - Biodiversity change

---

## Example Usage

```javascript
// Load and generate crisis cards only
const { loadEventsByType } = require('./lib/event-cards/load-events');
const { prepareEventForDisplay } = require('./lib/event-cards/field-definitions');
const { writeSingleEventCardPNG } = require('./lib/event-cards/layout-event-card');

const crisisEvents = loadEventsByType('game/config/event-cards.json', 'crisis');
for (const event of crisisEvents) {
  const prepared = prepareEventForDisplay(event);
  await writeSingleEventCardPNG(`output/${event.name}.png`, prepared, { dpi: 300 });
}
```

---

## Future Enhancements

- Add custom fonts/styling per event type
- Support for event card images/icons
- Alternate layout options (compact, detailed)
- Localization support for different languages
- PDF export for printable sheets

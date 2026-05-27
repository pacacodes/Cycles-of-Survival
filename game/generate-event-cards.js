#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { loadEvents, loadEventsByType } = require('./lib/event-cards/load-events');
const { prepareEventForDisplay } = require('./lib/event-cards/field-definitions');
const { loadManifest, saveManifest, getManifestRecord, createEventSignature } = require('./lib/event-cards/manifest');
const { writeFrontBackEventCardPNG } = require('./lib/event-cards/layout-event-card');
const { writeEventSheetsPNG } = require('./lib/event-cards/layout-event-sheets');
const { ensureDir } = require('./lib/file');

const REPO_ROOT = path.resolve(__dirname, '..');
const EVENT_CARD_RENDER_SIGNATURE = 'event-render-v3-connectors-periods';

/**
 * Parse command-line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    config: 'game/config/event-cards.json',
    outDir: 'Output/Event Cards',
    safeDir: 'saved_files/Event Cards',
    type: null, // null = all, 'crisis', 'recovery', 'mass_extinction'
    format: 'each', // 'each' = individual cards, 'sheet' = sheets, 'both'
    noOpen: true,
    forceAll: false,
    dpi: 300,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--config' && args[i + 1]) opts.config = args[++i];
    else if (a === '--outDir' && args[i + 1]) opts.outDir = args[++i];
    else if (a === '--safeDir' && args[i + 1]) opts.safeDir = args[++i];
    else if (a === '--type' && args[i + 1]) opts.type = args[++i];
    else if (a === '--format' && args[i + 1]) opts.format = args[++i];
    else if (a === '--open') opts.noOpen = false;
    else if (a === '--forceAll') opts.forceAll = true;
    else if (a === '--dpi' && args[i + 1]) {
      const parsed = Number(args[++i]);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error('--dpi must be a positive number');
      }
      opts.dpi = parsed;
    }
  }

  return opts;
}

/**
 * Get organized name for output directory based on event type
 */
function getEventTypeDir(eventType) {
  const typeNames = {
    crisis: 'Crisis',
    recovery: 'Recovery',
    mass_extinction: 'Mass Extinctions',
  };
  return typeNames[eventType] || 'All';
}

/**
 * Create file name for event card
 */
function getEventFileName(event, index, total) {
  const digits = Math.max(3, String(total).length);
  const num = String(index + 1).padStart(digits, '0');
  const sanitized = event.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  return `${num}-${sanitized}`;
}

/**
 * Remove PNG files not in expected set
 */
function removeUnexpectedPNGs(dirPath, expectedFiles) {
  if (!fs.existsSync(dirPath)) return;

  for (const entry of fs.readdirSync(dirPath)) {
    if (!entry.toLowerCase().endsWith('.png')) continue;
    if (expectedFiles.has(entry)) continue;
    fs.unlinkSync(path.join(dirPath, entry));
  }
}

(async function main() {
  try {
    const opts = parseArgs();
    const configPath = path.resolve(REPO_ROOT, opts.config);
    const outBaseDir = path.resolve(REPO_ROOT, opts.outDir);
    const safeBaseDir = path.resolve(REPO_ROOT, opts.safeDir);

    console.log('Loading events...');
    const rawEvents = opts.type
      ? loadEventsByType(configPath, opts.type)
      : loadEvents(configPath);

    if (!rawEvents.length) {
      console.log('No events found to generate.');
      return;
    }

    // Group events by type for organized output
    const eventsByType = {};
    rawEvents.forEach(event => {
      if (!eventsByType[event.type]) {
        eventsByType[event.type] = [];
      }
      eventsByType[event.type].push(event);
    });

    // Process each event type
    for (const [eventType, events] of Object.entries(eventsByType)) {
      console.log(`\nProcessing ${eventType} events (${events.length} cards)...`);

      const typeDir = getEventTypeDir(eventType);
      const outDir = path.join(outBaseDir, typeDir);
      const safeDir = path.join(safeBaseDir, typeDir);

      ensureDir(outDir);
      ensureDir(safeDir);

      const manifestPath = path.join(outDir, '.manifest.json');
      const safeManifestPath = path.join(safeDir, '.manifest.json');
      const previousManifest = loadManifest(manifestPath);
      const fallbackManifest = loadManifest(safeManifestPath);
      const activeManifest = Object.keys(previousManifest).length ? previousManifest : fallbackManifest;

      // Prepare events for display
      const preparedEvents = events.map((event, idx) => ({
        ...event,
        ...prepareEventForDisplay(event),
        fileName: getEventFileName(event, idx, events.length),
        index: idx,
      }));

      // Generate cards
      const newManifest = { _events: {} };
      const generatedPNGs = new Set();

      for (const event of preparedEvents) {
        const sig = `${createEventSignature(event)}|${EVENT_CARD_RENDER_SIGNATURE}`;
        const oldRecord = getManifestRecord(activeManifest, event.id);

        const shouldRegenerate = opts.forceAll || !oldRecord || oldRecord.signature !== sig;

        if (shouldRegenerate) {
          console.log(`  → ${event.name}`);

          if (opts.format === 'each' || opts.format === 'both') {
            const cardPath = path.join(outDir, `${event.fileName}.png`);
            await writeFrontBackEventCardPNG(cardPath, event, { dpi: opts.dpi });
            generatedPNGs.add(`${event.fileName}.png`);
          }
        } else {
          console.log(`  ✓ ${event.name} (cached)`);
          generatedPNGs.add(`${event.fileName}.png`);
        }

        newManifest._events[event.id] = {
          signature: sig,
          fileName: `${event.fileName}.png`,
          renderSignature: EVENT_CARD_RENDER_SIGNATURE,
        };
      }

      // Generate sheets if requested
      if (opts.format === 'sheet' || opts.format === 'both') {
        console.log(`\n  Generating event sheets...`);
        const sheetPath = path.join(outDir, `${eventType}-sheet.png`);
        await writeEventSheetsPNG(sheetPath, preparedEvents, { dpi: opts.dpi });
      }

      // Clean up old PNGs
      removeUnexpectedPNGs(outDir, generatedPNGs);

      // Save manifest
      saveManifest(manifestPath, newManifest);
      saveManifest(safeManifestPath, newManifest);

      console.log(`  ✓ Saved to ${outDir}`);
    }

    console.log('\n✓ Event cards generated successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();

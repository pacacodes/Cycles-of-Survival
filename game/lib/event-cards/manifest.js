const fs = require('fs');
const path = require('path');
const { ensureDir } = require('../file');

/**
 * Load manifest from file
 * @param {string} manifestPath - Path to .manifest.json
 * @returns {Object} Manifest object or empty object if not found
 */
function loadManifest(manifestPath) {
  try {
    if (!fs.existsSync(manifestPath)) return {};
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (_) {
    return {};
  }
}

/**
 * Save manifest to file atomically
 * @param {string} manifestPath - Path to .manifest.json
 * @param {Object} manifest - Manifest object to save
 */
function saveManifest(manifestPath, manifest) {
  ensureDir(path.dirname(manifestPath));
  const tempPath = `${manifestPath}.tmp-${process.pid}`;
  fs.writeFileSync(tempPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, manifestPath);
}

/**
 * Get manifest record for an event
 * @param {Object} manifest - Manifest object
 * @param {string} eventId - Event ID
 * @returns {Object|null} Record with signature and fileName, or null
 */
function getManifestRecord(manifest, eventId) {
  const events = manifest && manifest._events ? manifest._events : manifest;
  if (!events || !Object.prototype.hasOwnProperty.call(events, eventId)) {
    return null;
  }

  const record = events[eventId];
  if (typeof record === 'string') {
    return { signature: record, fileName: null };
  }

  return record;
}

/**
 * Create signature for event card
 * @param {Object} event - Prepared event object
 * @returns {string} JSON signature string
 */
function createEventSignature(event) {
  return JSON.stringify({
    id: event.id,
    name: event.name,
    type: event.type,
    period: event.period,
    approxMa: event.approxMa,
    trend: event.trend,
    scope: event.scope,
    effectText: event.effectText,
    co2Change: event.co2Change,
    o2Change: event.o2Change,
    biodiversityChange: event.biodiversityChange,
    biomesBad: event.biomesBad,
    biomesGood: event.biomesGood,
    organismsBad: event.organismsBad,
    organismsGood: event.organismsGood,
  });
}

module.exports = {
  loadManifest,
  saveManifest,
  getManifestRecord,
  createEventSignature,
};

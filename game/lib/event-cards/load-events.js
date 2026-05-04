const fs = require('fs');
const path = require('path');

/**
 * Load events from event-cards.json config file
 * @param {string} configPath - Path to event-cards.json
 * @returns {Array} Array of all events (crisis, recovery, extinction combined)
 */
function loadEvents(configPath) {
  const raw = fs.readFileSync(configPath, 'utf8');
  const data = JSON.parse(raw);
  
  if (!data.crisis && !data.recovery && !data.extinction) {
    throw new Error('event-cards.json must contain crisis, recovery, or extinction arrays');
  }

  const events = [];
  
  if (data.crisis && Array.isArray(data.crisis)) {
    events.push(...data.crisis);
  }
  if (data.recovery && Array.isArray(data.recovery)) {
    events.push(...data.recovery);
  }
  if (data.extinction && Array.isArray(data.extinction)) {
    events.push(...data.extinction);
  }

  return events;
}

/**
 * Load events by type (crisis, recovery, or extinction)
 * @param {string} configPath - Path to event-cards.json
 * @param {string} eventType - Type filter: 'crisis', 'recovery', or 'mass_extinction'
 * @returns {Array} Filtered array of events
 */
function loadEventsByType(configPath, eventType) {
  const raw = fs.readFileSync(configPath, 'utf8');
  const data = JSON.parse(raw);
  
  if (eventType === 'mass_extinction' && data.extinction && Array.isArray(data.extinction)) {
    return data.extinction;
  }
  
  if (data[eventType] && Array.isArray(data[eventType])) {
    return data[eventType];
  }

  return [];
}

module.exports = {
  loadEvents,
  loadEventsByType,
};

/**
 * Color scheme for event card types
 * Returns colors based on event type: crisis, recovery, or mass_extinction
 */

const EVENT_TYPE_COLORS = {
  crisis: {
    neon: '#FF8128',        // Orange
    background: '#4A90E2',  // Water blue
    titleText: '#FFFFFF',
  },
  recovery: {
    neon: '#22FF88',        // Cyan-green (distinct from organism greens)
    background: '#4A90E2',  // Water blue
    titleText: '#FFFFFF',
  },
  mass_extinction: {
    neon: '#FF4444',        // Red
    background: '#4A90E2',  // Water blue
    titleText: '#FFFFFF',
  },
};

/**
 * Get color scheme for an event type
 * @param {string} eventType - Type: 'crisis', 'recovery', or 'mass_extinction'
 * @returns {Object} Color object with neon, background, titleText
 */
function getEventColorScheme(eventType) {
  return EVENT_TYPE_COLORS[eventType] || EVENT_TYPE_COLORS.crisis;
}

/**
 * Get all color schemes
 * @returns {Object} All available color schemes
 */
function getAllColorSchemes() {
  return EVENT_TYPE_COLORS;
}

module.exports = {
  EVENT_TYPE_COLORS,
  getEventColorScheme,
  getAllColorSchemes,
};

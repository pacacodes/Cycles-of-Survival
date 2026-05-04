/**
 * Color scheme for event card types
 * Returns colors based on event type: crisis, recovery, or mass_extinction
 */

const EVENT_TYPE_COLORS = {
  crisis: {
    neon: '#9933FF',        // Purple
    background: '#F8F0FF',  // Light purple
    titleText: '#000000',
  },
  recovery: {
    neon: '#22FF88',        // Cyan-green (distinct from organism greens)
    background: '#F0FFF8',  // Light cyan-green
    titleText: '#000000',
  },
  mass_extinction: {
    neon: '#FF4444',        // Red
    background: '#FFF0F0',  // Light red
    titleText: '#000000',
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

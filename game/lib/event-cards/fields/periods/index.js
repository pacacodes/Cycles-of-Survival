/**
 * Periods field module for event cards
 * Orchestrates the drawing of the periods field with its backgrounds and styling
 */

const drawPeriodsField = require('./draw');
const drawBackgroundTop = require('./background-top');
const drawBackgroundBottom = require('./background-bottom');

/**
 * Main entry point for periods field
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} opts - Configuration options
 *   textX - left x position for text
 *   rowY - top y position for this row
 *   scale - render scale factor
 *   color - hex color for background
 *   titleColor - hex color for text
 *   main - main value string (period names)
 *   sub - optional timespan description
 *   maxWidth - optional max pixel width
 *   hexToRgba - helper function
 * @returns {object} - { height: number }
 */
module.exports = function drawPeriodsFieldRow(ctx, opts) {
  return drawPeriodsField(ctx, {
    ...opts,
    drawTop: drawBackgroundTop,
    drawBottom: drawBackgroundBottom,
  });
};

module.exports.drawPeriodsField = drawPeriodsField;
module.exports.drawBackgroundTop = drawBackgroundTop;
module.exports.drawBackgroundBottom = drawBackgroundBottom;

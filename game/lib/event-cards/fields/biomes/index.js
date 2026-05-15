/**
 * Biomes field module for event cards
 */

const drawBiomesField = require('./draw');
const drawBackgroundTop = require('./background-top');
const drawBackgroundBottom = require('./background-bottom');

module.exports = function drawBiomesFieldRow(ctx, opts) {
  return drawBiomesField(ctx, {
    ...opts,
    drawTop: drawBackgroundTop,
    drawBottom: drawBackgroundBottom,
  });
};

module.exports.drawBiomesField = drawBiomesField;
module.exports.drawBackgroundTop = drawBackgroundTop;
module.exports.drawBackgroundBottom = drawBackgroundBottom;

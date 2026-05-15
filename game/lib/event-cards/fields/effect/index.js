/**
 * Effect field module for event cards
 */

const drawEffectField = require('./draw');
const drawBackgroundTop = require('./background-top');
const drawBackgroundBottom = require('./background-bottom');

module.exports = function drawEffectFieldRow(ctx, opts) {
  return drawEffectField(ctx, {
    ...opts,
    drawTop: drawBackgroundTop,
    drawBottom: drawBackgroundBottom,
  });
};

module.exports.drawEffectField = drawEffectField;
module.exports.drawBackgroundTop = drawBackgroundTop;
module.exports.drawBackgroundBottom = drawBackgroundBottom;

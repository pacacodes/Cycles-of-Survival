/**
 * Organisms field module for event cards
 */

const drawOrganismsField = require('./draw');
const drawBackgroundTop = require('./background-top');
const drawBackgroundBottom = require('./background-bottom');

module.exports = function drawOrganismsFieldRow(ctx, opts) {
  return drawOrganismsField(ctx, {
    ...opts,
    drawTop: drawBackgroundTop,
    drawBottom: drawBackgroundBottom,
  });
};

module.exports.drawOrganismsField = drawOrganismsField;
module.exports.drawBackgroundTop = drawBackgroundTop;
module.exports.drawBackgroundBottom = drawBackgroundBottom;

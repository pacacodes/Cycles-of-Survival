module.exports = function drawSpaces(ctx, cfg, { gx, gy, cellPx, scale, INCH }) {
  if (!Array.isArray(cfg.spaces)) return;
  for (const space of cfg.spaces) {
    const x = gx + (space.col || 0) * cellPx;
    const y = gy + (space.row || 0) * cellPx;
    if (space.fill) {
      ctx.save();
      ctx.fillStyle = space.fill;
      ctx.fillRect(x, y, cellPx, cellPx);
      ctx.restore();
    }
    if (space.label) {
      ctx.save();
      ctx.fillStyle = space.color || '#000000';
      const fontSizePt = space.size || 10;
      ctx.font = `bold ${Math.round(fontSizePt * scale)}px "DejaVu Sans", sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const pad = 4 * scale;
      ctx.fillText(space.label, x + pad, y + pad);
      ctx.restore();
    }
  }
};

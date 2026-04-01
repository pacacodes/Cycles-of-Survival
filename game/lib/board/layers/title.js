module.exports = function drawTitle(ctx, cfg, widthPx, scale, INCH) {
  if (!cfg.title || !cfg.title.text) return;
  ctx.save();
  ctx.fillStyle = cfg.title.color || '#111111';
  const fontSizePt = cfg.title.size || 36;
  ctx.font = `bold ${Math.round(fontSizePt * scale)}px "DejaVu Sans", sans-serif`;
  const topPx = (cfg.title.topIn || 0.5) * INCH * scale;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(cfg.title.text, widthPx / 2, topPx);
  ctx.restore();
};

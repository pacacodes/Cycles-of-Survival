module.exports = function drawBackground(ctx, cfg, widthPx, heightPx) {
  ctx.save();
  ctx.fillStyle = cfg.page?.background || '#FAFAF8';
  ctx.fillRect(0, 0, widthPx, heightPx);
  ctx.restore();
};

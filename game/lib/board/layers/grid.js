module.exports = function drawGrid(ctx, cfg, { rows, cols, gx, gy, gridW, gridH, cellPx, scale }) {
  // Outer border
  ctx.save();
  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = cfg.grid?.borderColor || '#222222';
  ctx.strokeRect(gx, gy, gridW, gridH);
  ctx.restore();

  // Cells
  ctx.save();
  ctx.lineWidth = 0.5 * scale;
  ctx.strokeStyle = cfg.grid?.lineColor || '#777777';
  for (let r = 1; r < rows; r++) {
    const y = gy + r * cellPx;
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx + gridW, y);
    ctx.stroke();
  }
  for (let c = 1; c < cols; c++) {
    const x = gx + c * cellPx;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x, gy + gridH);
    ctx.stroke();
  }
  ctx.restore();
};

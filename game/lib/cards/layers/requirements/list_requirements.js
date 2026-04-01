module.exports = function listRequirements(ctx, x, y, { width, scale, card }) {
  ctx.save();
  ctx.fillStyle = '#424242';
  ctx.font = `${Math.round(9 * scale)}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const reqs = (card.requirements || []).map(r => String(r)).slice(0, 4);
  for (let i = 0; i < reqs.length; i++) {
    ctx.fillText(`• ${reqs[i]}`, x, y + i * (12 * scale));
  }
  ctx.restore();
};

const { slugify } = require('../file');

function selectSingleCard(cards, opts) {
  if (opts.cardIndex != null) {
    if (opts.cardIndex < 0 || opts.cardIndex >= cards.length) throw new Error(`cardIndex out of range (0..${cards.length - 1})`);
    return { card: cards[opts.cardIndex], name: `card-${opts.cardIndex}` };
  }
  if (opts.cardId) {
    const found = cards.find(c => String(c.id || '').toLowerCase() === String(opts.cardId).toLowerCase());
    if (!found) throw new Error(`No card found with id: ${opts.cardId}`);
    return { card: found, name: slugify(found.id || found.title) };
  }
  if (opts.cardTitle) {
    const found = cards.find(c => String(c.title || '').toLowerCase() === String(opts.cardTitle).toLowerCase());
    if (!found) throw new Error(`No card found with title: ${opts.cardTitle}`);
    return { card: found, name: slugify(found.title) };
  }
  return null;
}

module.exports = {
  selectSingleCard,
};

/**
 * Builds the ordered list of badge descriptors for a card.
 * Each entry has { type, label } and maps directly to a rendered badge + connector.
 */

function buildBadgeList(card) {
  const badgeList = [];

  if (card.organism_type) {
    badgeList.push({ type: 'functional', label: card.organism_type });
  }

  for (const b of card.biomes || []) {
    badgeList.push({ type: 'biome', label: b });
  }

  if (card.trophic_level) {
    const trophicLabel = card.trophic_level.replace(/\s*\(.*?\)/, '');
    badgeList.push({ type: 'trophic', label: trophicLabel });
  }

  if (card.role && (Array.isArray(card.role) ? card.role.length : card.role)) {
    const roleVal = Array.isArray(card.role) ? card.role[0] : card.role;
    badgeList.push({ type: 'role', label: roleVal });
  }

  if (card.periods && card.periods.length) {
    const seenPeriods = new Set();
    for (const p of card.periods) {
      if (!seenPeriods.has(p)) {
        badgeList.push({ type: 'period', label: p });
        seenPeriods.add(p);
      }
    }
  }

  return badgeList;
}

module.exports = { buildBadgeList };

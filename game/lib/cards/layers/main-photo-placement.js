/**
 * Computes the position and rendering options for the main photo on each card.
 * Per-card overrides are defined here so layout-png.js stays lean.
 */

const { CARD_BLEED_W, CARD_BLEED_H } = require('../../size');

function getMainPhotoPlacement(card, x, y, scale) {
  const label = (card && card.card_label) || '';
  const sci = ((card && card.scientific_name) || '').toLowerCase();

  const isCard1  = label === 'Card 1'  || sci === 'anabaena sp.';
  const isCard2  = label === 'Card 2'  || sci === 'thalassiosira pseudonana';
  const isCard3  = label === 'Card 3'  || sci === 'conophyton sp.';
  const isCard4  = label === 'Card 4'  || sci === 'escherichia coli';
  const isCard6  = label === 'Card 6';
  const isCard12 = label === 'Card 12';
  const isCard13 = label === 'Card 13';
  const isCard16 = label === 'Card 16';
  const isCard17 = label === 'Card 17';
  const isCard20 = label === 'Card 20';
  const isCard21 = label === 'Card 21' || sci === 'quercus robur';
  const isCard29 = label === 'Card 29';
  const isCard30 = label === 'Card 30';
  const isCard31 = label === 'Card 31';
  const isCard32 = label === 'Card 32' || sci === 'esox lucius';
  const isCard33 = label === 'Card 33';
  const isCard36 = label === 'Card 36' || sci === 'orcinus orca';
  const isCard39 = label === 'Card 39';
  const isCard49 = label === 'Card 49' || sci === 'hylonomus lyelli';
  const isCard57 = label === 'Card 57' || sci === 'stegosaurus stenops';
  const isCard58 = label === 'Card 58' || sci === 'brachiosaurus altithorax';
  const isCard59 = label === 'Card 59' || sci === 'velociraptor mongoliensis';
  const isCard60 = label === 'Card 60';
  const isCard62 = label === 'Card 62' || sci === 'triceratops horridus';
  const isCard63 = label === 'Card 63';
  const isCard64 = label === 'Card 64';
  const isCard65 = label === 'Card 65';
  const isCard66 = label === 'Card 66';
  const isCard68 = label === 'Card 68';
  const isCard69 = label === 'Card 69';
  const isCard70 = label === 'Card 70';
  const isCard71 = label === 'Card 71';
  const isCard72 = label === 'Card 72';
  const isCard73 = label === 'Card 73';
  const isCard74 = label === 'Card 74';
  const isCard75 = label === 'Card 75';
  const isCard76 = label === 'Card 76' || sci === 'pteropus vampyrus';
  const isCard77 = label === 'Card 77' || sci === 'schistocerca gregaria';
  const isCard78 = label === 'Card 78' || sci === 'apis mellifera';
  const isCard79 = label === 'Card 79' || sci === 'atta cephalotes';
  const isCard80 = label === 'Card 80' || sci === 'cladonia rangiferina';
  const isCard81 = label === 'Card 81' || sci === 'neophron percnopterus';
  const isCard82 = label === 'Card 82' || sci === 'aspergillus fumigatus';
  const isCard83 = label === 'Card 83' || sci === 'tenebrio molitor';
  const isCard85 = label === 'Card 85' || sci === 'argiope bruennichi';
  const isCard87 = label === 'Card 87' || sci === 'panthera onca';
  const isCard88 = label === 'Card 88' || sci === 'castor canadensis';
  const isCard89 = label === 'Card 89' || sci === 'acropora cervicornis';

  // --- Initial X position ---
  let mainPhotoX = isCard4
    ? x + 38
    : (isCard36
      ? x - 4
      : (isCard49
        ? x - 10
        : (isCard59 ? x - 95 : (isCard62 ? x - 3 : (isCard63 ? x - 50 : (isCard64 ? x - 40 : (isCard70 ? x + 10 : (isCard72 ? x + 40 : (isCard73 ? x + 10 : (isCard75 ? x - 20 : (isCard76 ? x - 20 : (isCard78 ? x - 80 : (isCard82 ? x - 40 : (isCard83 ? x - 5 : (isCard85 ? x - 85 : (isCard87 ? x : (isCard88 ? x + 10 : (isCard89 ? x + 57 : x))))))))))))))))));

  // --- Initial Y position ---
  let mainPhotoY = isCard36 ? y + 50 : (isCard62 ? y + 5 : (isCard63 ? y - 10 : (isCard69 ? y - 110 : (isCard70 ? y - 10 : (isCard72 ? y - 10 : (isCard73 ? y - 60 : (isCard74 ? y - 50 : (isCard75 ? y - 10 : (isCard76 ? y - 160 : (isCard77 ? y - 20 : (isCard78 ? y - 20 : (isCard79 ? y - 40 : (isCard83 ? y - 25 : (isCard88 ? y - 30 : (isCard85 ? y - 7 : (isCard87 ? y - 20 : y))))))))))))))));

  // --- Per-card adjustments ---
  if (isCard57) { mainPhotoX -= 40; mainPhotoY -= 60; }
  if (isCard30) { mainPhotoX -= 125; mainPhotoY -= 75; }
  if (isCard31) { mainPhotoX -= 20; mainPhotoY -= 20; }
  if (isCard32) { mainPhotoX += 40; mainPhotoY -= 57; }
  if (isCard33) { mainPhotoX -= 20; mainPhotoY -= 30; }
  if (isCard58) { mainPhotoX -= 90; mainPhotoY -= 5; }
  if (isCard1)  { mainPhotoX -= 10; }
  if (isCard2)  { mainPhotoX -= 20; }
  if (isCard3)  { mainPhotoY -= 100; }
  if (isCard4)  { mainPhotoX -= 10; mainPhotoY -= 30; }
  if (isCard6)  { mainPhotoY -= 40; }
  if (isCard12) { mainPhotoY -= 40; }
  if (isCard13) { mainPhotoY += 3; }
  if (isCard16) { mainPhotoY -= 40; }
  if (isCard17) { mainPhotoX += 40; }
  if (isCard20) { mainPhotoX -= 10; mainPhotoY -= 60; }
  if (isCard21) { mainPhotoX += 25; }
  if (isCard29) { mainPhotoX -= 40; }
  if (isCard60) { mainPhotoX -= 10; }
  if (isCard59) { mainPhotoX -= 18; mainPhotoY -= 20; }
  if (isCard62) { mainPhotoX -= 60; mainPhotoY -= 130; }
  if (isCard65) { mainPhotoX -= 50; }
  if (isCard66) { mainPhotoX -= 50; mainPhotoY -= 70; }
  if (isCard68) { mainPhotoX += 20; }
  if (isCard89) { mainPhotoY -= 80; }
  if (isCard39) { mainPhotoX -= 60; mainPhotoY += 60; }

  // --- Build options object ---
  const mainPhotoOptions = {
    width: CARD_BLEED_W * scale,
    height: CARD_BLEED_H * scale,
    scale,
    card,
    photoFitMode: 'contain',
  };

  if (isCard68 || isCard69 || isCard71 || isCard32 || isCard62) {
    mainPhotoOptions.flipHorizontal = true;
  }

  if (isCard2)       { mainPhotoOptions.photoScaleMultiplier = 0.96; }
  else if (isCard3)  { mainPhotoOptions.photoScaleMultiplier = 1.10; }
  else if (isCard13) { mainPhotoOptions.photoScaleMultiplier = 0.94; }
  else if (isCard4)  { mainPhotoOptions.photoScaleMultiplier = 1.00; }
  else if (isCard20) { mainPhotoOptions.photoScaleMultiplier = 0.95; }
  else if (isCard21) { mainPhotoOptions.photoScaleMultiplier = 0.97; }
  else if (isCard29) { mainPhotoOptions.photoScaleMultiplier = 0.75; }
  else if (isCard30) { mainPhotoOptions.photoScaleMultiplier = 1.19; }
  else if (isCard33) { mainPhotoOptions.photoScaleMultiplier = 0.95; }
  else if (isCard39) { mainPhotoOptions.photoScaleMultiplier = 0.80; }
  else if (isCard58) { mainPhotoOptions.photoScaleMultiplier = 1.11; }
  else if (isCard59) { mainPhotoOptions.photoScaleMultiplier = 1.16; }
  else if (isCard60) { mainPhotoOptions.photoScaleMultiplier = 1.02; mainPhotoOptions.photoFitMode = 'contain'; }
  else if (isCard69) { mainPhotoOptions.photoScaleMultiplier = 1.05; }
  else if (isCard73) { mainPhotoOptions.photoScaleMultiplier = 1.10; }
  else if (isCard76) { mainPhotoOptions.photoScaleMultiplier = 1.10; }
  else if (isCard78) { mainPhotoOptions.photoScaleMultiplier = 1.20; }
  else if (isCard80) { mainPhotoOptions.photoScaleMultiplier = 0.95; }
  else if (isCard81) { mainPhotoOptions.photoScaleMultiplier = 0.95; mainPhotoOptions.photoFitMode = 'contain'; }
  else if (isCard88) { mainPhotoOptions.photoScaleMultiplier = 1.15; }
  else if (isCard62) { mainPhotoOptions.photoScaleMultiplier = 1.05; }
  else if (isCard4 || isCard36) { mainPhotoOptions.photoScaleMultiplier = 1.10; }
  else if (isCard63) { mainPhotoOptions.photoScaleMultiplier = 1.03; }
  else if (isCard85) { mainPhotoOptions.photoScaleMultiplier = 1.10; mainPhotoOptions.photoFitMode = 'contain'; }
  else if (isCard87) { mainPhotoOptions.photoScaleMultiplier = 1.05; }
  else if (isCard65) { mainPhotoOptions.photoScaleMultiplier = 1.02; }
  else if (isCard66) { mainPhotoOptions.photoScaleMultiplier = 1.02; }
  else if (isCard89) { mainPhotoOptions.photoScaleMultiplier = 1.05; }

  return { mainPhotoX, mainPhotoY, mainPhotoOptions };
}

module.exports = { getMainPhotoPlacement };

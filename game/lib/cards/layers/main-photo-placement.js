/**
 * Computes the position and rendering options for the main photo on each card.
 * Per-card overrides are defined here so layout-png.js stays lean.
 */

const { CARD_BLEED_W, CARD_BLEED_H } = require('../../size');

function getMainPhotoPlacement(card, x, y, scale) {
  const label = (card && card.card_label) || '';
  const sci = ((card && card.scientific_name) || '').toLowerCase();

  // After organism relabeling, checks now reference scientific names for accuracy
  // Scientific name checks will find organisms at their new card positions
  const isAnabaena = sci === 'anabaena sp.';
  const isThalassiosira = sci === 'thalassiosira pseudonana';
  const isConophyton = sci === 'conophyton sp.';
  const isEscherichia = sci === 'escherichia coli';
  const isQuercus = sci === 'quercus robur';
  const isEsox = sci === 'esox lucius';
  const isOrcinus = sci === 'orcinus orca';
  const isHylonomus = sci === 'hylonomus lyelli';
  const isStegosaurus = sci === 'stegosaurus stenops';
  const isBrachiosaurus = sci === 'brachiosaurus altithorax';
  const isVelociraptor = sci === 'velociraptor mongoliensis';
  const isTriceratops = sci === 'triceratops horridus';
  const isPteroPus = sci === 'pteropus vampyrus';
  const isSchistocerca = sci === 'schistocerca gregaria';
  const isApis = sci === 'apis mellifera';
  const isAttaCephalotes = sci === 'atta cephalotes';
  const isCladonia = sci === 'cladonia rangiferina';
  const isNeophron = sci === 'neophron percnopterus';
  const isAspergillus = sci === 'aspergillus fumigatus';
  const isTenebrio = sci === 'tenebrio molitor';
  const isArgiope = sci === 'argiope bruennichi';
  const isPanthera = sci === 'panthera onca';
  const isCastor = sci === 'castor canadensis';
  const isAcropora = sci === 'acropora cervicornis';
  const isAnomalocaris = sci === 'anomalocaris canadensis';

  // --- Initial X position ---
  let mainPhotoX = x;
  if (isEscherichia) mainPhotoX = x + 38;
  else if (isOrcinus) mainPhotoX = x - 4;
  else if (isHylonomus) mainPhotoX = x - 10;
  else if (isVelociraptor) mainPhotoX = x - 95;
  else if (isTriceratops) mainPhotoX = x - 3;
  else if (isConophyton) mainPhotoX = x - 50;
  else if (isApis) mainPhotoX = x - 80;
  else if (isPteroPus) mainPhotoX = x - 20;
  else if (isAttaCephalotes) mainPhotoX = x - 40;
  else if (isAspergillus) mainPhotoX = x - 40;
  else if (isTenebrio) mainPhotoX = x - 5;
  else if (isArgiope) mainPhotoX = x - 85;
  else if (isCastor) mainPhotoX = x + 10;
  else if (isAcropora) mainPhotoX = x + 57;

  // --- Initial Y position ---
  let mainPhotoY = y;
  if (isOrcinus) mainPhotoY = y + 50;
  else if (isTriceratops) mainPhotoY = y + 5;
  else if (isConophyton) mainPhotoY = y - 10;
  else if (isVelociraptor) mainPhotoY = y - 110;
  else if (isStegosaurus) mainPhotoY = y - 10;
  else if (isBrachiosaurus) mainPhotoY = y - 10;
  else if (isAttaCephalotes) mainPhotoY = y - 60;
  else if (isSchistocerca) mainPhotoY = y - 50;
  else if (isPteroPus) mainPhotoY = y - 10;
  else if (isApis) mainPhotoY = y - 20;
  else if (isCladonia) mainPhotoY = y - 40;
  else if (isTenebrio) mainPhotoY = y - 25;
  else if (isCastor) mainPhotoY = y - 30;
  else if (isArgiope) mainPhotoY = y - 7;
  else if (isPanthera) mainPhotoY = y - 20;

  // --- Per-card adjustments ---
  if (isStegosaurus) { mainPhotoX -= 40; mainPhotoY -= 60; }
  if (isTriceratops) { mainPhotoX -= 60; mainPhotoY -= 130; }
  if (isConophyton) { mainPhotoX -= 20; mainPhotoY -= 20; }
  if (isEsox) { mainPhotoX += 40; mainPhotoY -= 57; }
  if (isHylonomus) { mainPhotoX -= 20; mainPhotoY -= 30; }
  if (isBrachiosaurus) { mainPhotoX -= 90; mainPhotoY -= 5; }
  if (isAnabaena)  { mainPhotoX -= 10; }
  if (isThalassiosira)  { mainPhotoX -= 20; }
  if (isConophyton)  { mainPhotoY -= 100; }
  if (isEscherichia)  { mainPhotoX -= 10; mainPhotoY -= 30; }
  if (isQuercus)  { mainPhotoY -= 40; }
  if (isApis) { mainPhotoX -= 40; }
  if (isSchistocerca) { mainPhotoX -= 10; }
  if (isVelociraptor) { mainPhotoX -= 18; mainPhotoY -= 20; }
  if (isConophyton) { mainPhotoX -= 50; mainPhotoY -= 70; }
  if (isAttaCephalotes) { mainPhotoX += 20; }
  if (isAcropora) { mainPhotoY -= 80; }
  if (isAnomalocaris) { mainPhotoX -= 20; mainPhotoY -= 10; }
  if (isHylonomus) { mainPhotoX -= 60; mainPhotoY += 60; }

  // --- Build options object ---
  const mainPhotoOptions = {
    width: CARD_BLEED_W * scale,
    height: CARD_BLEED_H * scale,
    scale,
    card,
    photoFitMode: 'contain',
  };

  if (isAttaCephalotes || isVelociraptor || isStegosaurus || isTriceratops) {
    mainPhotoOptions.flipHorizontal = true;
  }

  if (isThalassiosira)       { mainPhotoOptions.photoScaleMultiplier = 0.96; }
  else if (isConophyton)     { mainPhotoOptions.photoScaleMultiplier = 1.10; }
  else if (isEscherichia)    { mainPhotoOptions.photoScaleMultiplier = 1.00; }
  else if (isQuercus)        { mainPhotoOptions.photoScaleMultiplier = 0.97; }
  else if (isApis)           { mainPhotoOptions.photoScaleMultiplier = 0.75; }
  else if (isHylonomus)      { mainPhotoOptions.photoScaleMultiplier = 1.19; }
  else if (isBrachiosaurus)  { mainPhotoOptions.photoScaleMultiplier = 1.11; }
  else if (isVelociraptor)   { mainPhotoOptions.photoScaleMultiplier = 1.16; }
  else if (isStegosaurus)    { mainPhotoOptions.photoScaleMultiplier = 1.05; }
  else if (isPteroPus)       { mainPhotoOptions.photoScaleMultiplier = 1.10; }
  else if (isCladonia)       { mainPhotoOptions.photoScaleMultiplier = 0.95; }
  else if (isNeophron)       { mainPhotoOptions.photoScaleMultiplier = 0.95; mainPhotoOptions.photoFitMode = 'contain'; }
  else if (isCastor)         { mainPhotoOptions.photoScaleMultiplier = 1.15; }
  else if (isTriceratops)    { mainPhotoOptions.photoScaleMultiplier = 1.05; }
  else if (isOrcinus)        { mainPhotoOptions.photoScaleMultiplier = 1.10; }
  else if (isArgiope)        { mainPhotoOptions.photoScaleMultiplier = 1.10; mainPhotoOptions.photoFitMode = 'contain'; }
  else if (isPanthera)       { mainPhotoOptions.photoScaleMultiplier = 1.05; }
  else if (isAcropora)       { mainPhotoOptions.photoScaleMultiplier = 1.05; }

  return { mainPhotoX, mainPhotoY, mainPhotoOptions };
}

module.exports = { getMainPhotoPlacement };

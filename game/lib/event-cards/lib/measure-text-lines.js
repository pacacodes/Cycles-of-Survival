/**
 * Measures how many lines of text are needed for a given width
 * Wraps text by words and returns the number of lines
 */
module.exports = function measureTextLines(ctx, text, maxWidth) {
  if (!text || !maxWidth || maxWidth <= 0) {
    return 1;
  }

  const words = text.split(' ');
  let lines = 1;
  let currentLineW = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordW = ctx.measureText(word).width;
    const spaceW = ctx.measureText(' ').width;

    // Add space before word (if not first word on line)
    const separator = currentLineW > 0 ? spaceW : 0;
    const totalW = currentLineW + separator + wordW;

    if (totalW > maxWidth && currentLineW > 0) {
      // Word doesn't fit on current line, move to next line
      lines++;
      currentLineW = wordW;
    } else {
      // Word fits, add to current line
      currentLineW = totalW;
    }
  }

  return lines;
};

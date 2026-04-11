const fs = require('fs');

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const PHYS_CHUNK_TYPE = 'pHYs';
const IHDR_CHUNK_TYPE = 'IHDR';

let crcTable;

function getCrcTable() {
  if (crcTable) return crcTable;

  crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let crc = n;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    crcTable[n] = crc >>> 0;
  }

  return crcTable;
}

function crc32(buffer) {
  const table = getCrcTable();
  let crc = 0xFFFFFFFF;

  for (let index = 0; index < buffer.length; index++) {
    crc = table[(crc ^ buffer[index]) & 0xFF] ^ (crc >>> 8);
  }

  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function dpiToPixelsPerMeter(dpi) {
  return Math.round(dpi / 0.0254);
}

function createPhysChunk(dpi) {
  const ppm = dpiToPixelsPerMeter(dpi);
  const data = Buffer.alloc(9);
  data.writeUInt32BE(ppm, 0);
  data.writeUInt32BE(ppm, 4);
  data.writeUInt8(1, 8);
  return createChunk(PHYS_CHUNK_TYPE, data);
}

function setPngDensity(buffer, dpi = 300) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('Expected a PNG buffer');
  }

  if (!buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error('Invalid PNG signature');
  }

  const parts = [PNG_SIGNATURE];
  const physChunk = createPhysChunk(dpi);
  let offset = PNG_SIGNATURE.length;
  let insertedPhys = false;

  while (offset < buffer.length) {
    const chunkStart = offset;
    const chunkLength = buffer.readUInt32BE(offset);
    offset += 4;

    const chunkType = buffer.toString('ascii', offset, offset + 4);
    offset += 4;

    const dataEnd = offset + chunkLength;
    const crcEnd = dataEnd + 4;
    const chunkBuffer = buffer.subarray(chunkStart, crcEnd);

    if (chunkType !== PHYS_CHUNK_TYPE) {
      parts.push(chunkBuffer);
    }

    if (chunkType === IHDR_CHUNK_TYPE && !insertedPhys) {
      parts.push(physChunk);
      insertedPhys = true;
    }

    offset = crcEnd;
  }

  if (!insertedPhys) {
    throw new Error('PNG is missing IHDR chunk');
  }

  return Buffer.concat(parts);
}

function setPngFileDensity(filePath, dpi = 300) {
  const input = fs.readFileSync(filePath);
  const output = setPngDensity(input, dpi);
  fs.writeFileSync(filePath, output);
  return filePath;
}

module.exports = {
  setPngDensity,
  setPngFileDensity,
};
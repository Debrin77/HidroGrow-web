/**
 * Quita el fondo blanco EXTERIOR (conectado a los bordes del lienzo).
 * No toca blancos interiores del emblema (p. ej. cielo del círculo).
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output || !fs.existsSync(input)) {
  console.error('Uso: node remove-outer-white-bg.js <entrada.png> <salida.png>');
  process.exit(1);
}

function isOuterBg(r, g, b) {
  return r >= 228 && g >= 228 && b >= 228;
}

async function main() {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function tryPush(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const pi = idx * channels;
    if (!isOuterBg(data[pi], data[pi + 1], data[pi + 2])) return;
    visited[idx] = 1;
    queue.push(idx);
  }

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx / width) | 0;
    data[idx * channels + 3] = 0;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }

  await sharp(data, { raw: { width, height, channels } })
    .trim({ threshold: 1 })
    .png()
    .toFile(output);

  console.log('Escrito:', output);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

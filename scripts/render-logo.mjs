import fs from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const input = new URL("../assets/mckendi-logo.pdf", import.meta.url);
const publicDirectory = new URL("../public/", import.meta.url);
const data = new Uint8Array(fs.readFileSync(input));
const document = await pdfjsLib.getDocument({ data }).promise;
const page = await document.getPage(1);
const viewport = page.getViewport({ scale: 3 });
const canvas = createCanvas(viewport.width, viewport.height);
const context = canvas.getContext("2d");

context.fillStyle = "#ffffff";
context.fillRect(0, 0, canvas.width, canvas.height);
await page.render({ canvasContext: context, viewport }).promise;

const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
let minX = canvas.width;
let minY = canvas.height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < canvas.height; y += 1) {
  for (let x = 0; x < canvas.width; x += 1) {
    const index = (y * canvas.width + x) * 4;
    const red = pixels.data[index];
    const green = pixels.data[index + 1];
    const blue = pixels.data[index + 2];
    if (red < 247 || green < 247 || blue < 247) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const margin = 34;
minX = Math.max(0, minX - margin);
minY = Math.max(0, minY - margin);
maxX = Math.min(canvas.width - 1, maxX + margin);
maxY = Math.min(canvas.height - 1, maxY + margin);

const trimmed = createCanvas(maxX - minX + 1, maxY - minY + 1);
const trimmedContext = trimmed.getContext("2d");
trimmedContext.drawImage(canvas, minX, minY, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height);
const trimmedPixels = trimmedContext.getImageData(0, 0, trimmed.width, trimmed.height);

for (let index = 0; index < trimmedPixels.data.length; index += 4) {
  const red = trimmedPixels.data[index];
  const green = trimmedPixels.data[index + 1];
  const blue = trimmedPixels.data[index + 2];
  const distance = Math.max(0, 255 - Math.min(red, green, blue));
  if (distance < 8) trimmedPixels.data[index + 3] = 0;
  else if (distance < 24) trimmedPixels.data[index + 3] = Math.round((distance - 8) * 15.94);
}
trimmedContext.putImageData(trimmedPixels, 0, 0);

fs.writeFileSync(new URL("mckendi-logo.png", publicDirectory), trimmed.toBuffer("image/png"));

for (const width of [192, 320, 640]) {
  const height = Math.round((trimmed.height / trimmed.width) * width);
  const resized = createCanvas(width, height);
  resized.getContext("2d").drawImage(trimmed, 0, 0, width, height);
  fs.writeFileSync(new URL(`mckendi-logo-${width}.webp`, publicDirectory), resized.toBuffer("image/webp", 88));
}

const iconSource = await loadImage(new URL("mckendi-logo.png", publicDirectory));
const favicon = createCanvas(96, 96);
const faviconContext = favicon.getContext("2d");
faviconContext.fillStyle = "#fffaf1";
faviconContext.fillRect(0, 0, 96, 96);
const sourceRatio = iconSource.width / iconSource.height;
const drawWidth = 90;
const drawHeight = Math.round(drawWidth / sourceRatio);
faviconContext.drawImage(iconSource, 3, Math.round((96 - drawHeight) / 2), drawWidth, drawHeight);
fs.writeFileSync(new URL("favicon-96.png", publicDirectory), favicon.toBuffer("image/png"));

console.log(`Rendered Mckendi logo from ${input.pathname}.`);

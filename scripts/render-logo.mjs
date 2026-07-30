import fs from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const input = new URL("../assets/makendi-logo.png", import.meta.url);
const publicDirectory = new URL("../public/", import.meta.url);
const source = await loadImage(input);

fs.copyFileSync(input, new URL("makendi-logo.png", publicDirectory));

for (const width of [240, 480, 720]) {
  const height = Math.round((source.height / source.width) * width);
  const resized = createCanvas(width, height);
  resized.getContext("2d").drawImage(source, 0, 0, width, height);
  fs.writeFileSync(
    new URL(`makendi-logo-${width}.webp`, publicDirectory),
    resized.toBuffer("image/webp", 90),
  );
}

const favicon = createCanvas(96, 96);
const faviconContext = favicon.getContext("2d");
faviconContext.fillStyle = "#071a35";
faviconContext.roundRect(0, 0, 96, 96, 22);
faviconContext.fill();

const markSourceWidth = Math.round(source.width * 0.3);
const available = 78;
const markRatio = markSourceWidth / source.height;
const drawWidth = Math.min(available, Math.round(available * markRatio));
const drawHeight = Math.min(available, Math.round(drawWidth / markRatio));
faviconContext.drawImage(
  source,
  0,
  0,
  markSourceWidth,
  source.height,
  Math.round((96 - drawWidth) / 2),
  Math.round((96 - drawHeight) / 2),
  drawWidth,
  drawHeight,
);
fs.writeFileSync(new URL("favicon-96.png", publicDirectory), favicon.toBuffer("image/png"));

console.log(`Rendered approved Makendi logo assets from ${input.pathname}.`);

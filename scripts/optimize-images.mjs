import fs from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const assets = [
  { source: "instant-hero-source.png", output: "mckendi-instant-hero", widths: [640, 960, 1280] },
  { source: "spray-dried-source.png", output: "mckendi-spray-dried", widths: [480, 720, 960] },
  { source: "agglomerated-source.png", output: "mckendi-agglomerated", widths: [480, 720, 960] },
  { source: "freeze-dried-source.png", output: "mckendi-freeze-dried", widths: [480, 720, 960] },
];

for (const asset of assets) {
  const source = new URL(`../assets/ai-placeholder/${asset.source}`, import.meta.url);
  const image = await loadImage(source);
  for (const width of asset.widths) {
    const height = Math.round((image.height / image.width) * width);
    const canvas = createCanvas(width, height);
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);
    const destination = new URL(`../public/images/${asset.output}-${width}.webp`, import.meta.url);
    fs.writeFileSync(destination, canvas.toBuffer("image/webp", 86));
  }
  const largest = asset.widths.at(-1);
  fs.copyFileSync(
    new URL(`../public/images/${asset.output}-${largest}.webp`, import.meta.url),
    new URL(`../public/images/${asset.output}.webp`, import.meta.url),
  );
}

console.log(`Optimized ${assets.length} AI placeholder image sets for responsive delivery.`);

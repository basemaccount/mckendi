import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const directory = path.join(process.cwd(), "dist", "assets");
const files = await readdir(directory);
async function compressed(extension, candidates = files) {
  const matching = candidates.filter((file) => file.endsWith(extension));
  assert.ok(matching.length, `No ${extension} build assets found.`);
  let bytes = 0;
  for (const file of matching) bytes += gzipSync(await readFile(path.join(directory, file)), { level: 9 }).byteLength;
  return bytes;
}
const html = await readFile(path.join(process.cwd(), "dist", "index.html"), "utf8");
const criticalAssets = [...html.matchAll(/\/assets\/([^"'?]+\.(?:js|css))/g)].map((match) => match[1]);
const deferredAssets = files.filter((file) => !criticalAssets.includes(file));
const javascript = await compressed(".js", criticalAssets);
const css = await compressed(".css", criticalAssets);
const deferredJavascript = await compressed(".js", deferredAssets);
const deferredCss = await compressed(".css", deferredAssets);
const combined = javascript + css;
const total = combined + deferredJavascript + deferredCss;
assert.ok(javascript <= 96 * 1024, `Critical JavaScript gzip size ${javascript} exceeds 96KB.`);
assert.ok(css <= 13 * 1024, `Critical CSS gzip size ${css} exceeds 13KB.`);
assert.ok(combined <= 108 * 1024, `Critical combined gzip size ${combined} exceeds 108KB.`);
assert.ok(deferredJavascript <= 5 * 1024, `Deferred JavaScript gzip size ${deferredJavascript} exceeds 5KB.`);
assert.ok(deferredCss <= 5 * 1024, `Deferred CSS gzip size ${deferredCss} exceeds 5KB.`);
assert.ok(total <= 115 * 1024, `All critical and deferred assets total ${total} bytes, exceeding 115KB.`);
const kb = (bytes) => `${(bytes / 1024).toFixed(1)}KB`;
console.log(`Bundle budgets passed: ${kb(javascript)} critical JavaScript, ${kb(css)} critical CSS, ${kb(combined)} critical combined; ${kb(deferredJavascript)} deferred JavaScript and ${kb(deferredCss)} deferred CSS; ${kb(total)} total gzip.`);

import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const directory = path.join(process.cwd(), "dist", "assets");
const files = await readdir(directory);
async function compressed(extension) {
  const matching = files.filter((file) => file.endsWith(extension));
  assert.ok(matching.length, `No ${extension} build assets found.`);
  let bytes = 0;
  for (const file of matching) bytes += gzipSync(await readFile(path.join(directory, file)), { level: 9 }).byteLength;
  return bytes;
}
const javascript = await compressed(".js");
const css = await compressed(".css");
assert.ok(javascript <= 110 * 1024, `JavaScript gzip size ${javascript} exceeds 110KB.`);
assert.ok(css <= 15 * 1024, `CSS gzip size ${css} exceeds 15KB.`);
assert.ok(javascript + css <= 125 * 1024, `Combined bundle gzip size ${javascript + css} exceeds 125KB.`);
console.log(`Bundle budgets passed: ${(javascript / 1024).toFixed(1)}KB JavaScript gzip, ${(css / 1024).toFixed(1)}KB CSS gzip, ${((javascript + css) / 1024).toFixed(1)}KB combined.`);

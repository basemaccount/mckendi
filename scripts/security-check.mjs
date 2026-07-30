import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const vercelConfig = JSON.parse(
  await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
);
const globalHeaders = vercelConfig.headers.find(({ source }) => source === "/(.*)")?.headers || [];
const headers = new Map(globalHeaders.map(({ key, value }) => [key.toLowerCase(), value]));
const csp = headers.get("content-security-policy") || "";

assert.match(csp, /default-src 'self'/);
assert.match(csp, /object-src 'none'/);
assert.match(csp, /frame-ancestors 'none'/);
assert.equal(headers.get("x-content-type-options"), "nosniff");
assert.equal(headers.get("x-frame-options"), "DENY");
assert.equal(headers.get("cross-origin-resource-policy"), "same-origin");
assert.equal(headers.get("origin-agent-cluster"), "?1");
assert.equal(headers.get("x-dns-prefetch-control"), "off");
assert.match(headers.get("strict-transport-security") || "", /max-age=31536000/);

console.log("Static security policy checks passed.");

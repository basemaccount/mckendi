import { createHash, randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const buckets = globalThis.__mckendiInquiryBuckets || new Map();
globalThis.__mckendiInquiryBuckets = buckets;

function respond(response, status, body) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.end(JSON.stringify(body));
}

function clean(value, max = 2500) { return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : ""; }

function validOrigin(request) {
  if (!request.headers.origin) return true;
  try {
    const origin = new URL(request.headers.origin).host;
    const host = String(request.headers["x-forwarded-host"] || request.headers.host || "");
    const allowed = process.env.ALLOWED_ORIGIN ? new URL(process.env.ALLOWED_ORIGIN).host : "";
    return origin === host || origin === allowed;
  } catch { return false; }
}

function rateLimited(request) {
  const address = String(request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "unknown").split(",")[0];
  const key = createHash("sha256").update(`${process.env.RATE_LIMIT_SALT || "mckendi"}:${address}`).digest("hex").slice(0,24);
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) { buckets.set(key,{count:1,resetAt:now+600000}); return false; }
  entry.count += 1;
  return entry.count > 6;
}

export default async function handler(request, response) {
  if (request.method !== "POST") { response.setHeader("Allow","POST"); respond(response,405,{ok:false,message:"Method not allowed."}); return; }
  if (!String(request.headers["content-type"] || "").includes("application/json")) { respond(response,415,{ok:false,message:"Content-Type must be application/json."}); return; }
  if (!validOrigin(request)) { respond(response,403,{ok:false,message:"Request origin is not allowed."}); return; }
  if (rateLimited(request)) { respond(response,429,{ok:false,message:"Too many requests. Please try again later."}); return; }
  const input = typeof request.body === "object" ? request.body : JSON.parse(request.body || "{}");
  if (clean(input.website,200)) { respond(response,202,{ok:true}); return; }
  const payload = { name:clean(input.name,80), company:clean(input.company,120), email:clean(input.email,160), market:clean(input.market,100), product:clean(input.product,40), application:clean(input.application,120), volume:clean(input.volume,80), message:clean(input.message,2500), language:clean(input.language,5) };
  const validProducts = ["spray-dried","agglomerated","freeze-dried"];
  if (payload.name.length < 2 || payload.company.length < 2 || !EMAIL.test(payload.email) || payload.market.length < 2 || !validProducts.includes(payload.product) || payload.application.length < 2 || payload.message.length < 10 || input.consent !== true) { respond(response,422,{ok:false,message:"Check the required information and try again."}); return; }
  if (!process.env.BLOB_READ_WRITE_TOKEN) { respond(response,503,{ok:false,message:"Inquiry storage is not configured yet."}); return; }
  try {
    const receivedAt = new Date().toISOString();
    const id = randomUUID();
    const reference = `MKI-${receivedAt.slice(0,10).replaceAll("-","")}-${id.slice(0,8).toUpperCase()}`;
    const record = { id, reference, type:"product-inquiry", receivedAt, payload, context:{deployment:process.env.VERCEL_URL || "local",userAgent:clean(String(request.headers["user-agent"] || ""),300)}, workflow:{status:"new",owner:"unassigned",nextAction:"review"} };
    const path = `mckendi/inquiries/${receivedAt.slice(0,10)}/${receivedAt.replaceAll(":","-")}-${id}.json`;
    await put(path,JSON.stringify(record,null,2),{access:"private",addRandomSuffix:false,contentType:"application/json"});
    respond(response,201,{ok:true,reference,message:"Your inquiry has been received."});
  } catch (error) { console.error("Mckendi inquiry persistence failed",error); respond(response,500,{ok:false,message:"The inquiry could not be saved."}); }
}

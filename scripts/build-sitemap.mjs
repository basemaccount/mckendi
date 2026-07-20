import { writeFileSync } from "node:fs";

const baseUrl = String(process.env.PUBLIC_SITE_URL || "https://mckendi.vercel.app").replace(/\/$/, "");
const routes = ["/", "/products", "/products/spray-dried", "/products/agglomerated", "/products/freeze-dried", "/process", "/applications", "/contact", "/privacy"];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((path) => `  <url><loc>${baseUrl}${path}</loc></url>`).join("\n")}
</urlset>\n`;
writeFileSync("public/sitemap.xml", sitemap);
console.log(`Wrote ${routes.length} Mckendi sitemap URLs.`);

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";

const baseUrl = process.env.MCKENDI_BASE_URL || "http://127.0.0.1:4174";
const routes = ["/", "/products", "/products/spray-dried", "/products/agglomerated", "/products/freeze-dried", "/process", "/applications", "/contact", "/privacy"];
const browser = await chromium.launch();
const failures = [];
for (const path of routes) {
  for (const viewport of [{ name: "desktop", width: 1440, height: 1000 }, { name: "mobile", width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const actionable = results.violations.filter(({ impact }) => ["critical", "serious", "moderate"].includes(impact));
    actionable.forEach((violation) => failures.push(`${viewport.name}-${path}: [${violation.impact}] ${violation.id} — ${violation.help} (${violation.nodes.slice(0, 4).map((node) => node.target.join(" ")).join(", ")})`));
    console.log(`${viewport.name}-${path}: ${results.passes.length} rules passed, ${actionable.length} actionable violations`);
    await context.close();
  }
}
await browser.close();
if (failures.length) {
  console.error("\nAccessibility check failures:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else console.log("\nAccessibility checks passed at WCAG 2.2 A/AA for all audited routes.");

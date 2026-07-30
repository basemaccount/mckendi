import fs from "node:fs";
import { chromium } from "@playwright/test";

const outputDir = new URL("../test-output/", import.meta.url);
fs.mkdirSync(outputDir, { recursive: true });
const baseUrl = process.env.MCKENDI_BASE_URL || "http://127.0.0.1:4174";
const checks = [
  ["desktop-home", "/", 1440, 1000], ["desktop-products", "/products", 1440, 1000],
  ["desktop-spray", "/products/spray-dried", 1440, 1000], ["desktop-agglomerated", "/products/agglomerated", 1440, 1000],
  ["desktop-freeze", "/products/freeze-dried", 1440, 1000], ["desktop-process", "/process", 1440, 1000],
  ["desktop-applications", "/applications", 1440, 1000], ["desktop-contact", "/contact", 1440, 1000],
  ["desktop-privacy", "/privacy", 1440, 1000], ["tablet-home", "/", 768, 900],
  ["mobile-home", "/", 390, 844], ["mobile-products", "/products", 390, 844],
  ["mobile-freeze", "/products/freeze-dried", 390, 844], ["mobile-process", "/process", 390, 844],
  ["mobile-contact", "/contact", 390, 844], ["compact-home", "/", 320, 700], ["landscape-home", "/", 844, 390],
].map(([name, path, width, height]) => ({ name, path, width, height }));
const browser = await chromium.launch();
const failures = [];
for (const check of checks) {
  const context = await browser.newContext({ viewport: { width: check.width, height: check.height }, hasTouch: check.width <= 844 });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${baseUrl}${check.path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`${check.name}.png`, outputDir).pathname, fullPage: false });
  const audit = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    h1Count: document.querySelectorAll("h1").length,
    title: document.title,
    canonical: document.querySelector('link[rel="canonical"]')?.href || "",
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
    hasCart: Boolean(document.querySelector('[class*="cart"], [aria-label*="cart" i], [aria-label*="sepet" i]')),
    hasPrice: /(?:[$€£]\s?\d|\d(?:[.,]\d{2})?\s?(?:USD|EUR|TRY|TL)\b)/i.test(document.body.innerText),
  }));
  if (audit.scrollWidth > audit.clientWidth + 1) failures.push(`${check.name}: horizontal overflow ${audit.scrollWidth}px > ${audit.clientWidth}px`);
  if (audit.h1Count !== 1) failures.push(`${check.name}: expected one h1, found ${audit.h1Count}`);
  if (audit.brokenImages) failures.push(`${check.name}: ${audit.brokenImages} broken images`);
  if (!audit.canonical.endsWith(check.path === "/" ? "/" : check.path)) failures.push(`${check.name}: canonical did not match route`);
  if (audit.hasCart) failures.push(`${check.name}: cart UI was present`);
  if (audit.hasPrice) failures.push(`${check.name}: price-like public text was present`);
  if (errors.length) failures.push(`${check.name}: ${errors.join(" | ")}`);

  if (check.name === "desktop-home") {
    const brandLockup = page.locator(".brand-lockup").first();
    if (!(await brandLockup.isVisible()) || !(await brandLockup.textContent())?.includes("Makendi.coffee")) failures.push("desktop-home: Makendi.coffee brand lockup was missing");
    if (!(await page.locator('.brand-lockup__mark img[src="/makendi-logo.png"]').first().isVisible())) failures.push("desktop-home: approved Makendi logo mark was missing");
    if ((await page.locator(".brand-lockup__sun").count()) !== 0) failures.push("desktop-home: retired placeholder emblem remained");
    if ((await page.getByText(/Mckendi/i).count()) !== 0) failures.push("desktop-home: retired Mckendi spelling remained visible");
    if ((await page.locator(".image-disclosure, .hero__image-note").count()) !== 4) failures.push("desktop-home: temporary AI images were not fully disclosed");
    const englishHeading = await page.locator("h1").textContent();
    await page.getByRole("button", { name: "TR" }).click();
    if ((await page.locator("h1").textContent()) === englishHeading) failures.push("desktop-home: Turkish localisation did not apply");
    if ((await page.locator("html").getAttribute("lang")) !== "tr") failures.push("desktop-home: document language did not change");
  }
  if (check.name === "mobile-home") {
    const heroMediaTop = await page.locator(".hero__media").evaluate((element) => element.getBoundingClientRect().top);
    if (heroMediaTop >= check.height) failures.push(`mobile-home: product photography began below the first viewport at ${Math.round(heroMediaTop)}px`);
    const productMedia = await page.locator(".product-card__media").evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
    if (productMedia.some(({ width, height }) => height > width + 2)) failures.push("mobile-home: a product-card image exceeded its intended compact aspect ratio");
    const menu = page.getByRole("button", { name: "Open navigation" });
    await menu.click();
    if (!(await page.getByRole("navigation", { name: "Mobile navigation" }).isVisible())) failures.push("mobile-home: navigation did not open");
    if (!(await page.locator("#main-content").evaluate((element) => element.inert))) failures.push("mobile-home: content was not inert while menu open");
    if (!(await page.locator("#mobile-navigation a").first().evaluate((element) => document.activeElement === element))) failures.push("mobile-home: focus did not enter menu");
    await page.keyboard.press("Escape");
    if (!(await menu.evaluate((element) => document.activeElement === element))) failures.push("mobile-home: focus did not return to menu trigger");
  }
  if (check.name === "mobile-products") {
    const pageHero = await page.locator(".page-hero").evaluate((element) => element.getBoundingClientRect().height);
    if (pageHero > check.height * 0.72) failures.push(`mobile-products: page hero consumed ${Math.round(pageHero)}px`);
  }
  if (check.name === "mobile-freeze") {
    const productLayout = await page.locator(".product-detail__grid").evaluate((element) => {
      const copy = element.querySelector(".product-detail__copy").getBoundingClientRect();
      const media = element.querySelector(".product-detail__media").getBoundingClientRect();
      const heading = element.querySelector("h1").getBoundingClientRect();
      return {
        copyTop: copy.top,
        mediaTop: media.top,
        mediaHeight: media.height,
        headingBottom: heading.bottom,
        viewportHeight: innerHeight,
      };
    });
    if (productLayout.copyTop >= productLayout.mediaTop) failures.push("mobile-freeze: product information did not precede product photography");
    if (productLayout.headingBottom > productLayout.viewportHeight) failures.push("mobile-freeze: product name was not visible in the first viewport");
    if (productLayout.mediaHeight > productLayout.viewportHeight * 0.62) failures.push("mobile-freeze: product photography was taller than the mobile reading window");
  }
  if (check.name === "mobile-contact") {
    if ((await page.locator(".inquiry-form input[required], .inquiry-form select[required], .inquiry-form textarea[required]").count()) < 8) failures.push("mobile-contact: required inquiry fields missing");
    if (!(await page.locator('.inquiry-form input[name="consent"]').getAttribute("required") !== null)) failures.push("mobile-contact: privacy consent not required");
    if (!(await page.locator('a[href="mailto:info@makendi.com"]').first().isVisible())) failures.push("mobile-contact: direct email channel was missing");
    if (!(await page.locator('a[href="tel:+902163407028"]').first().isVisible())) failures.push("mobile-contact: direct phone channel was missing");
    if (!(await page.getByText("www.makendi.coffee", { exact: true }).first().isVisible())) failures.push("mobile-contact: planned Makendi domain was missing");
  }
  console.log(`${check.name}: ${audit.clientWidth}x${check.height}, scrollWidth=${audit.scrollWidth}, title="${audit.title}"`);
  await context.close();
}
await browser.close();
if (failures.length) {
  console.error("\nVisual/responsive check failures:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else console.log("\nVisual, responsive, localisation and interaction checks passed.");

import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { languages, pagePath } from "../src/languages.mjs";

const site = JSON.parse(
  await readFile(new URL("../src/site.json", import.meta.url), "utf8"),
);
const base = new URL(site.url).pathname;
const root = resolve("dist");
const scratch = resolve(process.env.ABOUT_SCRATCH || "../.tmp/cache-verify");
await mkdir(scratch, { recursive: true });
process.env.TMPDIR = resolve(scratch, "tmp");
await mkdir(process.env.TMPDIR, { recursive: true });
// Simulate already cached assets from an incompatible layout, without disabling HTTP caching.
const legacy = new Map([
  ["style.css", "body{font-family:serif}.reader-select-caret{position:static}"],
  ["client.js", "window.legacyClient = true;"],
  ["talk-reader.js", "window.legacyReader = true;"],
]);
const hits = new Map();
const mime = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".html": "text/html",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, "http://localhost").pathname;
    hits.set(path, (hits.get(path) || 0) + 1);
    if (path === base + "cache-prime/") {
      response.writeHead(200, {
        "Content-Type": "text/html",
        "Cache-Control": "no-store",
      });
      response.end(
        `<html><head><link rel="stylesheet" href="${base}assets/style.css"><script src="${base}assets/client.js" defer></script><script src="${base}assets/talk-reader.js" defer></script></head><body>Previous release</body></html>`,
      );
      return;
    }
    for (const [name, body] of legacy)
      if (path === base + "assets/" + name) {
        response.writeHead(200, {
          "Content-Type": mime[extname(name)],
          "Cache-Control": "public,max-age=31536000,immutable",
        });
        response.end(body);
        return;
      }
    assert(path.startsWith(base));
    let file = resolve(root, path.slice(base.length));
    assert(file === root || file.startsWith(root + sep));
    if (path.endsWith("/")) file = resolve(file, "index.html");
    response.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
      "Cache-Control": path.includes("/assets/")
        ? "public,max-age=31536000,immutable"
        : "no-store",
    });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const results = [];
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
    args: ["--no-sandbox"],
  });
  for (const { code } of languages)
    for (const theme of ["light", "dark"])
      for (const width of [375, 1440]) {
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme: theme,
          locale: "ru-RU",
        });
        const page = await context.newPage();
        await page.goto(origin + base + "cache-prime/");
        assert.equal(await page.evaluate(() => window.legacyReader), true);
        const cachedHits = [...legacy.keys()].map((name) =>
          hits.get(base + "assets/" + name),
        );
        await page.goto(origin + base + "cache-prime/?visit=2");
        assert.deepEqual(
          [...legacy.keys()].map((name) => hits.get(base + "assets/" + name)),
          cachedHits,
          "Old assets really came from the browser HTTP cache",
        );
        await page.goto(origin + pagePath(code, base) + "talks/gorod-it-2023/");
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.evaluate(() => window.legacyReader), undefined);
        assert.equal(await page.evaluate(() => window.legacyClient), undefined);
        await page.locator("#slide-1").waitFor({ state: "visible" });
        for (const [selector, attribute, name] of [
          ["link[rel=stylesheet]", "href", "style.css"],
          ["script[src*=client]", "src", "client.js"],
          ["script[src*=talk-reader]", "src", "talk-reader.js"],
        ]) {
          const url = new URL(
            await page.locator(selector).getAttribute(attribute),
            origin,
          );
          const bytes = await readFile(
            resolve(root, url.pathname.slice(base.length)),
          );
          const hash = createHash("sha256")
            .update(bytes)
            .digest("hex")
            .slice(0, 16);
          assert.equal(
            url.pathname,
            base + "assets/" + name.replace(/(\.[^.]+)$/, `.${hash}$1`),
          );
        }
        const geometry = await page
          .locator(".reader-select-caret")
          .evaluate((e) => {
            const caret = e.getBoundingClientRect();
            const select = document
              .querySelector("[data-reader-select]")
              .getBoundingClientRect();
            return {
              position: getComputedStyle(e).position,
              appearance: getComputedStyle(
                document.querySelector("[data-reader-select]"),
              ).appearance,
              inside:
                caret.left >= select.left &&
                caret.right <= select.right &&
                caret.top >= select.top &&
                caret.bottom <= select.bottom,
              font: getComputedStyle(document.body).fontFamily,
            };
          });
        assert.equal(geometry.position, "absolute");
        assert.equal(geometry.appearance, "none");
        assert(
          geometry.inside,
          "Exactly positioned caret stays inside the native select",
        );
        assert(geometry.font.includes("Noto Sans"));
        await page.locator("[data-reader-next]").focus();
        await page.keyboard.press("ArrowRight");
        await page.waitForURL((url) => url.hash === "#slide-2");
        if (code === "ru") {
          await page.locator("#slide-2 img").evaluate((img) => img.decode());
          await page.screenshot({
            path: resolve(scratch, `upgrade-${code}-${theme}-${width}.png`),
          });
        }
        await page.goto(
          origin + pagePath(code, base) + (code === "ru" ? "?lang=ru" : ""),
        );
        assert.equal(
          await page
            .locator(".contact-section")
            .evaluate((e) => getComputedStyle(e).borderTopWidth),
          "1px",
        );
        assert.deepEqual(
          [...legacy.keys()].map((name) => hits.get(base + "assets/" + name)),
          cachedHits,
          "Current pages never reuse legacy asset URLs",
        );
        results.push({ code, theme, width, passed: true });
        console.log(
          `Cache upgrade ${code}/${theme}/${width}: real cached old CSS/JS, new assets, caret geometry, font, keyboard, contact divider PASS`,
        );
        await context.close();
      }
  await writeFile(
    resolve(scratch, "cache-results.json"),
    JSON.stringify({ passed: true, checks: results }, null, 2),
  );
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
}

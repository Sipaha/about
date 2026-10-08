import { verifyPhotoViewer } from "./verify-photo-viewer.mjs";
import { chromium } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { languages, pagePath } from "../src/languages.mjs";
const require = createRequire(import.meta.url);
const shared = JSON.parse(
  await readFile(
    new URL("../src/talks/gorod-it-2024/shared.json", import.meta.url),
    "utf8",
  ),
);
const site = JSON.parse(
  await readFile(new URL("../src/site.json", import.meta.url), "utf8"),
);
const base = new URL(site.url).pathname;
const scratch = resolve(
  process.env.ABOUT_SCRATCH || "../.tmp/talk-2024/verify",
);
await mkdir(scratch, { recursive: true });
process.env.TMPDIR = resolve(scratch, "tmp");
await mkdir(process.env.TMPDIR, { recursive: true });
const socket = createServer();
await new Promise((r) => socket.listen(0, "127.0.0.1", r));
const port = socket.address().port;
await new Promise((r) => socket.close(r));
const child = spawn(process.execPath, ["scripts/preview.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "inherit"],
});
await new Promise((r, j) => {
  child.stdout.once("data", r);
  child.once("error", j);
  child.once("exit", (code) => j(new Error(`Preview exited: ${code}`)));
});
const origin = `http://127.0.0.1:${port}`;
const folder = "talks/gorod-it-2024/";
const route = (lang) => pagePath(lang, base) + folder;
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
    args: ["--no-sandbox"],
  });
  for (const { code } of languages)
    for (const theme of ["light", "dark"])
      for (const width of [320, 768, 1440]) {
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme: theme,
        });
        const page = await context.newPage();
        const errors = [],
          requests = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("request", (r) => requests.push(r.url()));
        assert.equal((await page.goto(origin + route(code))).status(), 200);
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator("[data-slide]").count(), 23);
        assert.equal(
          await page
            .locator(
              ".talk-question, a[href*=youtube], a[href*=youtu], a[href='#questions']",
            )
            .count(),
          0,
        );
        assert.equal(
          await page.locator(".talk-gallery img").count(),
          shared.photos.length,
        );
        await page.locator("#photos summary").click();
        for (const image of await page.locator(".talk-gallery img").all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((img) => img.decode());
          assert(await image.evaluate((img) => img.naturalWidth > 0));
        }
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await verifyPhotoViewer({
          page,
          shared,
          scratch,
          tag: `${code}/${theme}/${width}`,
        });
        if (code === "ru" && [320, 1440].includes(width))
          await page.locator("#photos").screenshot({
            path: resolve(scratch, `gallery-2024-${theme}-${width}.png`),
          });
        await page.locator("#photos summary").click();
        for (let i = 1; i <= 23; i++) {
          await page
            .locator("[data-reader-select]")
            .selectOption(String(i - 1));
          const image = page.locator(`#slide-${i} img`);
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((img) => img.decode());
          assert.equal(await image.evaluate((img) => img.naturalWidth), 1200);
          assert.equal(await image.evaluate((img) => img.naturalHeight), 675);
        }
        assert(await page.locator("[data-reader-next]").isDisabled());
        await page.locator("[data-reader-select]").selectOption("16");
        await page.locator("#slide-17 [data-image-view]").click();
        assert(await page.locator(".presentation-view").isVisible());
        await page.keyboard.press("ArrowRight");
        await page.waitForURL((url) => url.hash === "#slide-18");
        assert.equal(new URL(page.url()).hash, "#slide-18");
        await page.keyboard.press("Escape");
        await page.reload();
        assert(await page.locator("#slide-18").isVisible());
        await page.locator(".language-menu summary").click();
        const other = code === "en" ? "ru" : "en";
        await page.locator(`[data-language='${other}']`).click();
        await page.waitForURL((url) => url.pathname === route(other));
        assert.equal(new URL(page.url()).hash, "#slide-18");
        await page.goto(origin + route(code));
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.addScriptTag({
          path: require.resolve("axe-core/axe.min.js"),
        });
        const axe = await page.evaluate(() =>
          axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          }),
        );
        assert.deepEqual(
          axe.violations.map((v) => v.id),
          [],
        );
        assert.deepEqual(errors, []);
        assert(requests.every((url) => url.startsWith(origin)));
        if (code === "ru")
          await page.screenshot({
            path: resolve(scratch, `2024-${theme}-${width}.png`),
            fullPage: true,
          });
        console.log(
          `2024 ${code}/${theme}/${width}: 23 slides, dialog, language, no video, local requests, accessibility PASS`,
        );
        await context.close();
      }
  for (const { code } of languages) {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(origin + route(code));
    assert.equal(await page.locator("[data-slide]:visible").count(), 23);
    await page.evaluate(() => document.fonts.ready);
    await page.locator("#photos summary").focus();
    await page.keyboard.press("Space");
    assert.equal(
      await page.locator("#photos img:visible").count(),
      shared.photos.length,
    );
    const photoResponse = await page.request.get(
      origin + base + shared.photos[1].image,
    );
    assert.match(photoResponse.headers()["content-type"], /image\/jpeg/);
    const pdf = await page.request.get(origin + base + shared.pdf);
    assert.equal(pdf.status(), 200);
    assert.equal((await pdf.body()).subarray(0, 5).toString(), "%PDF-");
    const sitemap = await (
      await page.request.get(origin + base + "sitemap.xml")
    ).text();
    assert(sitemap.includes("https://sipaha.github.io" + route(code)));
    await context.close();
  }
  console.log("2024: all eight no-JS readers, PDF and sitemap PASS");
} finally {
  await browser?.close();
  child.kill("SIGTERM");
}

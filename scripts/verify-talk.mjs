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
    new URL("../src/talks/gorod-it-2023/shared.json", import.meta.url),
    "utf8",
  ),
);
const site = JSON.parse(
  await readFile(new URL("../src/site.json", import.meta.url), "utf8"),
);
const base = new URL(site.url).pathname;
const scratch = resolve(process.env.ABOUT_SCRATCH || "../.tmp/talk-verify");
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
const folder = "talks/gorod-it-2023/";
const route = (lang) => pagePath(lang, base) + folder;
let browser;
const results = [];
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  for (const { code } of languages)
    for (const theme of ["light", "dark"])
      for (const width of [320, 768, 1440]) {
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme: theme,
          locale: "ru-RU",
        });
        const page = await context.newPage();
        const errors = [],
          requests = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("request", (request) => requests.push(request.url()));
        const response = await page.goto(origin + route(code));
        assert.equal(response.status(), 200);
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator("html").getAttribute("lang"), code);
        assert.equal(
          await page.locator("html").getAttribute("data-theme"),
          theme,
        );
        assert.equal(
          await page.locator("[rel=canonical]").getAttribute("href"),
          "https://sipaha.github.io" + route(code),
        );
        assert.equal(await page.locator("link[hreflang]").count(), 9);
        assert.equal(await page.locator("[data-slide]").count(), 36);
        assert.equal(await page.locator("[data-slide]:visible").count(), 1);
        assert.equal(await page.locator(".talk-question").count(), 4);
        assert(await page.locator("[data-reader-prev]").isDisabled());
        await page.locator("[data-reader-next]").focus();
        await page.keyboard.press("ArrowRight");
        await page.waitForURL((url) => url.hash === "#slide-2");
        await page.locator("#slide-2").waitFor({ state: "visible" });
        assert.equal(new URL(page.url()).hash, "#slide-2");
        assert(await page.locator("#slide-2").isVisible());
        await page.keyboard.press("ArrowLeft");
        await page.waitForURL((url) => url.hash === "#slide-1");
        await page.locator("#slide-1").waitFor({ state: "visible" });
        assert(await page.locator("#slide-1").isVisible());
        const numbers =
          width === 320 && theme === "light"
            ? Array.from({ length: 36 }, (_, i) => i + 1)
            : [1, 16, 18, 19, 22, 25, 26, 29, 32, 36];
        for (const number of numbers) {
          await page
            .locator("[data-reader-select]")
            .selectOption(String(number - 1));
          const slide = page.locator(`#slide-${number}`);
          assert(await slide.isVisible());
          assert.equal(await page.locator("[data-slide]:visible").count(), 1);
          await slide.locator("img").evaluate((img) => img.decode());
          assert.equal(
            await slide.locator("img").evaluate((img) => img.naturalWidth),
            1200,
          );
          assert(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            `${code}/${theme}/${width}/slide-${number}: overflow`,
          );
          assert.equal(
            await slide.locator("figure a").first().getAttribute("href"),
            base + shared.slides[number - 1].image,
          );
          const video = new URL(
            await slide.locator("figcaption a").getAttribute("href"),
          );
          assert.equal(
            Number(video.searchParams.get("t")),
            shared.slides[number - 1].start,
          );
          if (number === 26)
            await slide.screenshot({
              path: resolve(
                scratch,
                `talk-${code}-${theme}-${width}-slide26.png`,
              ),
            });
        }
        assert(await page.locator("[data-reader-next]").isDisabled());
        await page.locator("[data-reader-prev]").click();
        assert(await page.locator("#slide-35").isVisible());
        await page.goto(origin + route(code) + "#slide-26");
        assert(await page.locator("#slide-26").isVisible());
        assert.equal(
          await page.locator("[data-reader-select]").inputValue(),
          "25",
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
          axe.violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target),
          })),
          [],
          `${code}/${theme}/${width}: accessibility`,
        );
        await page
          .locator(".talk-toc")
          .evaluate((element) => (element.open = true));
        await page.locator('.talk-toc a[href="#slide-18"]').click();
        await page.locator("#slide-18").waitFor({ state: "visible" });
        assert(await page.locator("#slide-18").isVisible());
        await page
          .locator(".talk-toc")
          .evaluate((element) => (element.open = false));
        await page.locator("[data-reader-select]").selectOption("25");
        const other = code === "en" ? "ru" : "en";
        await page.locator(".language").click();
        await page.locator(`[data-language="${other}"]`).click();
        assert.equal(new URL(page.url()).pathname, route(other));
        assert.equal(new URL(page.url()).hash, "#slide-26");
        assert(await page.locator("#slide-26").isVisible());
        await page.locator("[data-theme-toggle]").click();
        await page.reload();
        assert.equal(
          await page.locator("html").getAttribute("data-theme"),
          theme === "light" ? "dark" : "light",
        );
        assert.deepEqual(errors, []);
        assert(
          requests.every((url) => url.startsWith(origin)),
          "No external runtime requests",
        );
        await context.close();
        results.push({ code, theme, width, passed: true });
        console.log(
          `Talk ${code}/${theme}/${width}: slides, images, code layout, keyboard, deep links, language continuity, axe PASS`,
        );
      }
  for (const { code } of languages) {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 850 },
    });
    const page = await context.newPage();
    await page.goto(origin + route(code));
    assert.equal(await page.locator("[data-slide]:visible").count(), 36);
    assert.equal(await page.locator(".reader-controls").isVisible(), false);
    await page
      .locator(".talk-toc")
      .evaluate((element) => (element.open = true));
    await page.locator('.talk-toc a[href="#slide-26"]').click();
    assert.equal(new URL(page.url()).hash, "#slide-26");
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await context.close();
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(origin + route("en"));
  const pdf = await page.request.get(origin + base + shared.pdf);
  assert.equal(pdf.status(), 200);
  assert.equal((await pdf.body()).subarray(0, 5).toString(), "%PDF-");
  const sitemap = await (
    await page.request.get(origin + base + "sitemap.xml")
  ).text();
  for (const { code } of languages)
    assert(sitemap.includes("https://sipaha.github.io" + route(code)));
  await context.close();
  console.log(
    "Talk no-JS: all 36 slides readable in every locale; original PDF and eight sitemap routes PASS",
  );
  await writeFile(
    resolve(scratch, "talk-results.json"),
    JSON.stringify({ passed: true, checks: results }, null, 2),
  );
} finally {
  await browser?.close();
  child.kill("SIGTERM");
}

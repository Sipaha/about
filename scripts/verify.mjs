import { chromium } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import { languages, pagePath } from "../src/languages.mjs";
import { content } from "../src/content.mjs";
const require = createRequire(import.meta.url);
const site = JSON.parse(
  await readFile(new URL("../src/site.json", import.meta.url), "utf8"),
);
const scratch = resolve(
  process.env.ABOUT_SCRATCH || "../.agents/tmp/about/verify",
);
await mkdir(scratch, { recursive: true });
process.env.TMPDIR = resolve(scratch, "tmp");
await mkdir(process.env.TMPDIR, { recursive: true });
const server = createServer();
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
await new Promise((r) => server.close(r));
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
const base = new URL(site.url).pathname;
let browser;
const summaries = [];
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  for (const { code: lang } of languages)
    for (const theme of ["light", "dark"])
      for (const width of [375, 768, 1440]) {
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme: theme,
          permissions: ["clipboard-read", "clipboard-write"],
        });
        const page = await context.newPage();
        const errors = [];
        const requests = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("request", (r) => requests.push(r.url()));
        await page.goto(origin + pagePath(lang, base));
        await page.evaluate(() => document.fonts.ready);
        assert.equal(
          await page.locator('link[rel="canonical"]').getAttribute("href"),
          site.url + (lang === "ru" ? "" : `${lang}/`),
        );
        assert(await page.locator("#profile-title").isVisible());
        assert(
          await page.evaluate(
            () =>
              document.querySelector("#projects").offsetTop <
              document.querySelector("#support").offsetTop,
          ),
        );
        await page.locator(".nav-support").click();
        assert.equal(new URL(page.url()).hash, "#support");
        await page.evaluate(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );

        assert.equal(await page.locator("html").getAttribute("lang"), lang);
        assert.equal(
          await page.locator("html").getAttribute("data-theme"),
          theme,
        );
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          "Horizontal overflow",
        );
        for (const w of site.wallets) {
          assert.equal(
            await page.locator(`#address-${w.id}`).inputValue(),
            w.address,
          );
          const png = PNG.sync.read(
            await page.locator(`img[src$="qr-${w.id}.svg"]`).screenshot(),
          );
          const qr = jsQR(
            new Uint8ClampedArray(png.data),
            png.width,
            png.height,
          );
          assert.equal(
            qr?.data,
            w.address,
            "Rendered QR must decode to exact public address",
          );
        }
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
          `${lang}/${theme}/${width} accessibility`,
        );
        await page.screenshot({
          path: resolve(scratch, `${lang}-${theme}-${width}.png`),
          fullPage: true,
        });
        for (const [index, wallet] of site.wallets.entries()) {
          await page.locator("[data-copy]").nth(index).click();
          assert.equal(
            await page.evaluate(() => navigator.clipboard.readText()),
            wallet.address,
          );
        }
        assert.match(
          await page.locator("[role=status]").first().innerText(),
          new RegExp(content[lang].copied),
        );
        await page.locator("[data-theme-toggle]").click();
        await page.reload();
        assert.equal(
          await page.locator("html").getAttribute("data-theme"),
          theme === "light" ? "dark" : "light",
        );
        await page.locator(".language").click();
        await page
          .locator(`[data-language="${lang === "ru" ? "en" : "ru"}"]`)
          .click();
        assert.equal(
          await page.locator("html").getAttribute("lang"),
          lang === "ru" ? "en" : "ru",
        );
        assert.deepEqual(errors, []);
        assert(
          requests.every((u) => u.startsWith(origin)),
          "No external runtime requests",
        );
        summaries.push(
          `${lang}/${theme}/${width}: QR, clipboard, layout, accessibility, theme, language OK`,
        );
        console.log(summaries.at(-1));
        await context.close();
      }
  for (const { code } of languages) {
    const context = await browser.newContext({
      locale: code === "zh" ? "zh-CN" : code,
      reducedMotion: "reduce",
    });
    await context.addInitScript(() =>
      Object.defineProperty(navigator, "webdriver", { get: () => false }),
    );
    const page = await context.newPage();
    await page.goto(origin + base + "?ref=test#support");
    assert.equal(
      page.url(),
      origin + pagePath(code, base) + "?ref=test#support",
    );
    await page.locator(".language").click();
    await page.locator('[data-language="de"]').click();
    assert.equal(
      page.url(),
      origin + pagePath("de", base) + "?ref=test#support",
    );
    await page.goto(origin + base);
    assert.equal(await page.locator("html").getAttribute("lang"), "de");
    await page.goto(origin + pagePath("ja", base));
    assert.equal(await page.locator("html").getAttribute("lang"), "ja");
    await page.locator(".language").click();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".language-options").isVisible(), false);
    await context.close();
  }
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({
      locale: "pt-BR",
      javaScriptEnabled,
    });
    if (javaScriptEnabled)
      await context.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false });
        Object.defineProperty(window, "localStorage", {
          get: () => {
            throw Error("Disabled");
          },
        });
      });
    const page = await context.newPage();
    await page.goto(origin + base);
    assert.equal(
      await page.locator("html").getAttribute("lang"),
      javaScriptEnabled ? "pt" : "ru",
    );
    await page.locator(".language").click();
    await page.locator('[data-language="zh"]').click();
    assert.equal(await page.locator("html").getAttribute("lang"), "zh");
    await context.close();
  }
  const unsupported = await browser.newContext({ locale: "fa-IR" });
  await unsupported.addInitScript(() =>
    Object.defineProperty(navigator, "webdriver", { get: () => false }),
  );
  const up = await unsupported.newPage();
  await up.goto(origin + base);
  assert.equal(await up.locator("html").getAttribute("lang"), "en");
  await unsupported.close();
  console.log(
    "Language detection, saved choice, direct routes, hash/query, storage denial and no-JS switching: OK",
  );
  const fallback = await browser.newContext();
  const page = await fallback.newPage();
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("Denied");
        },
      },
    }),
  );
  await page.goto(origin + base);
  await page.locator("[data-copy]").first().click();
  assert.match(
    await page.locator("[role=status]").first().innerText(),
    /вручную/,
  );
  assert.equal(
    await page
      .locator("textarea")
      .first()
      .evaluate((el) => el.selectionEnd - el.selectionStart),
    site.wallets[0].address.length,
  );
  await fallback.close();
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const np = await nojs.newPage();
  await np.goto(origin + base);
  assert.equal(
    await np.locator("textarea").first().inputValue(),
    site.wallets[0].address,
  );
  assert(await np.locator(".qr-frame img").first().isVisible());
  assert.equal(await np.locator("[data-copy]").first().isVisible(), false);
  await nojs.close();
  for (const { code } of languages) {
    const small = await browser.newContext({
      viewport: { width: 320, height: 760 },
      reducedMotion: "reduce",
    });
    const sp = await small.newPage();
    await sp.goto(origin + pagePath(code, base));
    assert(
      await sp.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await sp.screenshot({
      path: resolve(scratch, `${code}-light-320.png`),
      fullPage: true,
    });
    await small.close();
  }
  console.log(
    "Clipboard denial, no-JavaScript, 320px reduced-motion fallback: OK",
  );
  await writeFile(
    resolve(scratch, "results.json"),
    JSON.stringify({ passed: true, checks: summaries }, null, 2),
  );
} finally {
  await browser?.close();
  child.kill("SIGTERM");
}

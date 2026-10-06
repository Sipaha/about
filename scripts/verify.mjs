import { chromium } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { PNG } from "pngjs";
import jsQR from "jsqr";
const require = createRequire(import.meta.url);
const site = JSON.parse(
  await readFile(new URL("../src/site.json", import.meta.url), "utf8"),
);
const scratch = resolve(
  process.env.ABOUT_SCRATCH || "../.agents/tmp/about/verify",
);
await mkdir(scratch, { recursive: true });
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
  for (const lang of ["ru", "en"])
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
        await page.goto(origin + base + (lang === "en" ? "en/" : ""));
        await page.evaluate(() => document.fonts.ready);
        assert.equal(
          await page.locator('link[rel="canonical"]').getAttribute("href"),
          site.url + (lang === "en" ? "en/" : ""),
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
        await page.locator("[data-copy]").first().click();
        assert.equal(
          await page.evaluate(() => navigator.clipboard.readText()),
          site.wallets[0].address,
        );
        assert.match(
          await page.locator("[role=status]").first().innerText(),
          lang === "ru" ? /скопирован/ : /copied/,
        );
        await page.locator("[data-theme-toggle]").click();
        await page.reload();
        assert.equal(
          await page.locator("html").getAttribute("data-theme"),
          theme === "light" ? "dark" : "light",
        );
        await page.locator(".language").click();
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
  const small = await browser.newContext({
    viewport: { width: 320, height: 760 },
    reducedMotion: "reduce",
  });
  const sp = await small.newPage();
  await sp.goto(origin + base);
  assert(
    await sp.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  );
  await sp.screenshot({
    path: resolve(scratch, "ru-light-320.png"),
    fullPage: true,
  });
  await small.close();
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

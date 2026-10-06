import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const dir = resolve(
  process.env.DONATE_SCRATCH || "../.agents/tmp/donate/audit",
);
await mkdir(dir, { recursive: true });
const profile = await mkdtemp(resolve(dir, "chrome-"));
const chrome = await launch({
  chromePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  userDataDir: profile,
  chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  const result = await lighthouse(
    process.env.SITE_URL || "http://127.0.0.1:4317/donate/",
    {
      port: chrome.port,
      output: "json",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      logLevel: "error",
    },
  );
  await writeFile(resolve(dir, "lighthouse.json"), result.report);
  console.log(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(result.lhr.categories).map(([k, v]) => [k, v.score]),
      ),
      null,
      2,
    ),
  );
  console.log(
    "Metrics:",
    result.lhr.audits["largest-contentful-paint"].displayValue,
    result.lhr.audits["cumulative-layout-shift"].displayValue,
  );
} finally {
  await chrome.kill();
}

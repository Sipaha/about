import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

export async function verifyPhotoViewer({ page, shared, scratch, tag }) {
  const links = page.locator(".talk-gallery a");
  const viewer = page.locator(".photo-view");
  const image = viewer.locator("img");
  const previous = viewer.locator("[data-photo-prev]");
  const next = viewer.locator("button.presentation-next");
  const photo = viewer.locator(".photo-image");
  const originalHash = new URL(page.url()).hash;
  const count = shared.photos.length;
  await links.first().click();
  await viewer.waitFor({ state: "visible" });
  const check = async (index) => {
    const path = shared.photos[index].image;
    await page.waitForFunction(
      (path) => document.querySelector(".photo-view img").src.endsWith(path),
      path,
    );
    await image.evaluate((img) => img.decode());
    assert.equal(
      await image.getAttribute("alt"),
      await links.nth(index).locator("img").getAttribute("alt"),
    );
    assert.equal(
      await viewer.locator("[data-photo-caption]").textContent(),
      await image.getAttribute("alt"),
    );
    const contained = await image.evaluate((img) => {
      const rect = img.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.left >= 0 &&
        rect.top >= 0 &&
        rect.right <= innerWidth &&
        rect.bottom <= innerHeight
      );
    });
    assert(contained, `${tag}: image fits viewport`);
  };
  await check(0);
  if (count > 1) {
    await previous.click();
    await check(count - 1);
    await next.click();
    await check(0);
    await photo.click();
    await check(1);
    await page.keyboard.press("ArrowRight");
    await check(2);
    await page.keyboard.press("ArrowLeft");
    await check(1);
    for (let i = 2; i < count; i++) {
      await photo.click();
      await check(i);
    }
    await photo.click();
    await check(0);
  } else {
    assert(await previous.isDisabled());
    assert(await next.isDisabled());
    assert(await photo.isDisabled());
  }
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const accessibility = await page.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  assert.deepEqual(
    accessibility.violations.map((v) => v.id),
    [],
    `${tag}: photo dialog accessibility`,
  );
  await page.keyboard.press("Tab");
  assert(
    await page.evaluate(
      () =>
        document.activeElement === document.body ||
        document.querySelector(".photo-view").contains(document.activeElement),
    ),
    "focus stays in dialog",
  );
  await links.first().focus();
  assert(
    await links.first().evaluate((link) => link !== document.activeElement),
    "background is inert while the dialog is open",
  );
  await viewer.locator("form button").focus();
  if (tag.startsWith("ru/") && (tag.endsWith("/320") || tag.endsWith("/1440")))
    await page.screenshot({
      path: resolve(
        scratch,
        `photo-viewer-${shared.id}-${tag.replaceAll("/", "-")}.png`,
      ),
    });
  await page.keyboard.press("Escape");
  await viewer.waitFor({ state: "hidden" });
  assert(
    await links.first().evaluate((link) => link === document.activeElement),
    "focus returns to opening thumbnail",
  );
  assert.equal(
    new URL(page.url()).hash,
    originalHash,
    "photos preserve the selected slide",
  );
  await links.nth(count - 1).click();
  await viewer.waitFor({ state: "visible" });
  await check(count - 1);
  await viewer.locator("form button").click();
  await viewer.waitFor({ state: "hidden" });
  assert(
    await links
      .nth(count - 1)
      .evaluate((link) => link === document.activeElement),
  );
}

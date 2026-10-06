import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateSite } from "../src/validate.mjs";
const site = JSON.parse(
  await readFile(new URL("../src/site.json", import.meta.url), "utf8"),
);
test("owner-provided Bitcoin address passes mainnet checksum validation", () =>
  assert.equal(
    validateSite(structuredClone(site)).wallets[0].address,
    "bc1q7flpdhcm59jdz83gfzk0rf5gc36k32q0td6m6v",
  ));
test("a one-character address typo blocks publishing", () => {
  const s = structuredClone(site);
  s.wallets[0].address = s.wallets[0].address.slice(0, -1) + "q";
  assert.throws(() => validateSite(s));
});
test("a missing public address blocks publishing", () => {
  const s = structuredClone(site);
  s.wallets[0].address = "";
  assert.throws(() => validateSite(s));
});
test("unknown coin/network combinations cannot silently render", () => {
  const s = structuredClone(site);
  s.wallets[0].network = "TON";
  assert.throws(() => validateSite(s));
});
test("a phishing Boosty host or unsafe protocol is rejected", () => {
  for (const url of [
    "https://boosty.to.example.com/user",
    "javascript:alert(1)",
  ]) {
    const s = structuredClone(site);
    s.boosty = url;
    assert.throws(() => validateSite(s));
  }
});
test("duplicate wallet IDs cannot produce conflicting copy targets", () => {
  const s = structuredClone(site);
  s.wallets.push({ ...s.wallets[0] });
  assert.throws(() => validateSite(s));
});

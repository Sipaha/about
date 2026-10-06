import test from "node:test";
import assert from "node:assert/strict";
import { content } from "../src/content.mjs";
import { languages, pagePath, languageTarget } from "../src/languages.mjs";
const codes = languages.map((l) => l.code);
const input = {
  codes,
  base: "/about/",
  path: "/about/",
  search: "?source=demo",
  hash: "#support",
  stored: null,
  languages: ["en-US"],
  userAgent: "Browser",
  webdriver: false,
};
test("every advertised language has full copy, metadata and three project descriptions", () => {
  const keys = Object.keys(content.en)
    .filter((k) => k !== "language")
    .sort();
  for (const { code } of languages) {
    const value = content[code];
    assert.deepEqual(
      Object.keys(value)
        .filter((k) => k !== "language" && k !== "projectDescriptions")
        .sort(),
      keys,
    );
    for (const key of keys)
      assert.equal(typeof value[key], "string", `${code}.${key}`);
    if (!["ru", "en"].includes(code)) {
      assert.equal(value.projectDescriptions.length, 3);
      assert(
        value.projectDescriptions.every(
          (s) => typeof s === "string" && s.length,
        ),
      );
    }
    assert.match(value.aboutText, /2015/);
    assert.match(value.aboutText, /2018/);
    assert.match(value.bitcoin, /Bitcoin/);
    assert.match(value.bitcoin, /Lightning/);
  }
});
test("locale matching prefers saved choice then ordered browser preferences, with English fallback", () => {
  for (const code of codes)
    assert.equal(
      languageTarget({ ...input, languages: [`${code}-XX`] }),
      code === "ru" ? null : `/about/${code}/?source=demo#support`,
    );
  assert.equal(
    languageTarget({ ...input, stored: "ru", languages: ["zh-CN"] }),
    null,
  );
  assert.equal(
    languageTarget({ ...input, stored: "de", languages: ["ru"] }),
    "/about/de/?source=demo#support",
  );
  assert.equal(
    languageTarget({
      ...input,
      stored: "invalid",
      languages: ["fa-IR", "ja-JP"],
    }),
    "/about/ja/?source=demo#support",
  );
  assert.equal(
    languageTarget({ ...input, languages: ["fa-IR"] }),
    "/about/en/?source=demo#support",
  );
  assert.equal(
    languageTarget({ ...input, languages: ["zh-TW", "en-US"] }),
    "/about/en/?source=demo#support",
  );
});
test("explicit language URLs, crawlers and automation are not redirected", () => {
  for (const code of codes.filter((c) => c !== "ru"))
    assert.equal(
      languageTarget({
        ...input,
        path: pagePath(code, input.base),
        stored: "ru",
      }),
      null,
    );
  assert.equal(languageTarget({ ...input, userAgent: "Googlebot" }), null);
  assert.equal(languageTarget({ ...input, webdriver: true }), null);
});

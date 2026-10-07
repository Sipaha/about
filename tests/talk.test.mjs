import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { languages } from "../src/languages.mjs";
const directory = new URL("../src/talks/gorod-it-2023/", import.meta.url);
const load = (name) =>
  JSON.parse(readFileSync(new URL(name + ".json", directory), "utf8"));
const shared = load("shared");
const source = load("source");
const ru = load("ru");
test("all eight talk locales retain every slide, paragraph, question and interface label", () => {
  for (const { code } of languages) {
    const locale = load(code);
    assert.deepEqual(Object.keys(locale).sort(), Object.keys(ru).sort(), code);
    for (const [key, value] of Object.entries(locale)) {
      if (!["slides", "questions"].includes(key))
        assert.equal(typeof value, "string", `${code}.${key}`);
    }
    for (const section of ["slides", "questions"]) {
      assert.equal(
        locale[section].length,
        ru[section].length,
        `${code}.${section}`,
      );
      locale[section].forEach((entry, i) => {
        assert(entry.title.trim(), `${code}/${section}/${i}: title`);
        assert.equal(
          entry.body.length,
          ru[section][i].body.length,
          `${code}/${section}/${i}: paragraphs`,
        );
        assert(entry.body.every((p) => typeof p === "string" && p.trim()));
      });
    }
    assert.deepEqual(
      locale.slideStatus.match(/\{\w+\}/g).sort(),
      ["{current}", "{title}", "{total}"].sort(),
    );
  }
});
test("technical attribute expressions and endpoints survive translation", () => {
  const tokens = new Map([
    [17, ["emodel/person@admin"]],
    [18, ["sourceId", "language", "query", "groupBy", "sortBy", "page"]],
    [20, ["counterparty.fullOrgName", "association0.association1.someField"]],
    [21, ["attribute?scalar"]],
    [22, ["name?disp"]],
    [23, ["counterparty.fullOrgName?str"]],
    [
      24,
      [
        'counterparty.fullOrgName?str!"unknown"',
        'counterparty.fullOrgName?str|or("unknown")',
      ],
    ],
    [25, ["userId"]],
    [26, ["totalCount"]],
    [27, ["email!'undefined'"]],
    [29, ["/gateway/records/mutate"]],
    [31, ["emodel/person@", "pk.simonov"]],
    [32, ["emodel/person@pk.simonov"]],
  ]);
  for (const { code } of languages) {
    const locale = load(code);
    for (const [index, expected] of tokens) {
      const text = locale.slides[index].body.join(" ");
      for (const token of expected)
        assert(text.includes(token), `${code}/slide-${index + 1}: ${token}`);
    }
    for (const token of ["user.email", "sourceId", "JOIN", "SQL"])
      assert(
        locale.questions[2].body.join(" ").includes(token),
        `${code}/questions: ${token}`,
      );
  }
});
test("all 36 original slides exist and topic timestamps stay within this talk", () => {
  assert.equal(shared.slides.length, 36);
  assert.equal(shared.questions.length, 4);
  let previous = source.talkStart;
  for (const slide of shared.slides) {
    assert(slide.start >= previous && slide.start < source.talkEnd);
    previous = slide.start;
    assert(existsSync(new URL("../public/" + slide.image, import.meta.url)));
  }
  assert(source.talkStart <= source.speakerStart);
  assert(source.speakerStart < source.talkEnd);
  assert(source.talkEnd <= source.questionsStart);
  assert(source.questionsStart < source.questionsEnd);
  assert.equal(source.editedTranscript, "ru.json");
  assert(existsSync(new URL(source.editedTranscript, directory)));
  assert(
    shared.questions.every(
      (q) => q.start >= source.questionsStart && q.start < source.questionsEnd,
    ),
  );
});
test("normalised JSON examples remain parseable without changing API values", () => {
  let count = 0;
  for (const slide of shared.slides)
    for (const part of (slide.code ?? "").split("\n\n")) {
      if (part.trim().startsWith("{")) {
        JSON.parse(part);
        count++;
      }
    }
  assert.equal(count, 10);
  assert(shared.slides[25].code.includes('"admin@citeck.ru"'));
  assert(shared.slides[31].code.includes('"pk.simonov"'));
});

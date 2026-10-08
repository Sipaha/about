import { readFile, writeFile, mkdir } from "node:fs/promises";
import { pagePath } from "../src/languages.mjs";

export async function buildTalkPages({
  root,
  out,
  site,
  languages,
  icon,
  esc,
  themeScript,
  assets,
}) {
  const base = new URL(site.url).pathname;
  const urls = [];
  for (const talk of site.conferences) {
    const folder = `talks/${talk.id}/`;
    const shared = JSON.parse(
      await readFile(new URL(`src/talks/${talk.id}/shared.json`, root), "utf8"),
    );
    const pathFor = (code) => pagePath(code, base) + folder;
    for (const lang of languages) {
      const t = JSON.parse(
        await readFile(
          new URL(`src/talks/${talk.id}/${lang.code}.json`, root),
          "utf8",
        ),
      );
      if (
        t.slides.length !== shared.slides.length ||
        t.questions.length !== shared.questions.length
      )
        throw new Error(`Incomplete talk locale: ${lang.code}`);
      const person = lang.code === "ru" ? site.owner.nameRu : site.owner.name;
      const canonical = new URL(pathFor(lang.code), site.url).href;
      const home =
        pagePath(lang.code, base) +
        (lang.code === "ru" ? "?lang=ru" : "") +
        "#conferences";
      const videoAt = (time) => shared.video + "&t=" + Math.floor(time);
      const articles = await Promise.all(
        shared.slides.map(async (slide, index) => {
          const copy = t.slides[index];
          if (!copy.title || !copy.body?.length)
            throw new Error(`Empty slide ${index + 1}/${lang.code}`);
          const image = base + slide.image;
          return `<article class="talk-slide" id="slide-${slide.number}" data-slide="${slide.number}"><h2 class="talk-slide-heading"><span>${slide.number} / ${shared.slides.length}</span>${esc(copy.title)}</h2><div class="talk-columns"><figure class="talk-figure"><a href="${image}" data-image-view aria-label="${esc(t.enlargeSlide)} ${slide.number}"><img src="${image}" width="${shared.width ?? 1200}" height="${shared.height ?? 900}" alt="${esc(t.original)} ${slide.number}: ${esc(copy.title)}" loading="lazy" decoding="async"></a><figcaption>${esc(t.original)} · RU ${shared.video ? `<a href="${videoAt(slide.start)}">${esc(t.video)} ${await icon("arrow-up-right")}</a>` : ""}</figcaption></figure><section class="talk-text" aria-label="${esc(t.transcript)}"><h3>${esc(t.transcript)}</h3>${copy.body.map((p) => `<p>${esc(p)}</p>`).join("")}${slide.code ? `<h3 class="talk-code-label">${esc(t.codeLabel)}</h3><pre><code>${esc(slide.code)}</code></pre>` : ""}${(slide.links ?? []).map((url) => `<p class="talk-reference"><a href="${esc(url)}">${esc(url)}</a></p>`).join("")}</section></div></article>`;
        }),
      );
      const questions = t.questions
        .map(
          (question, i) =>
            `<article class="talk-question"><h3><a href="${videoAt(shared.questions[i].start)}">${esc(question.title)}</a></h3>${question.body.map((p) => `<p>${esc(p)}</p>`).join("")}</article>`,
        )
        .join("");
      if (shared.photos?.length && t.photoAlts?.length !== shared.photos.length)
        throw new Error(`Incomplete photo descriptions: ${lang.code}`);
      const gallery = shared.photos?.length
        ? `<details class="talk-gallery" id="photos"><summary>${esc(t.photosTitle)} <span>(${shared.photos.length})</span></summary><div class="talk-gallery-grid">${shared.photos.map((photo, i) => `<figure><a href="${base}${esc(photo.image)}"><img src="${base}${esc(photo.thumbnail)}" width="${photo.width}" height="${photo.height}" alt="${esc(t.photoAlts[i])}" loading="lazy" decoding="async"></a><figcaption>${esc(t.photoAlts[i])}</figcaption></figure>`).join("")}</div></details>`
        : "";
      const photoViewer = shared.photos?.length
        ? `<dialog class="photo-view" aria-label="${esc(t.photosTitle)}" data-photo-status-label="${esc(t.photoStatus)}"><div class="photo-shell"><div class="photo-stage"><button class="photo-image" type="button" data-photo-next aria-label="${esc(t.next)}"><img alt=""></button><button class="presentation-arrow presentation-previous" type="button" data-photo-prev aria-label="${esc(t.previous)}">${await icon("arrow-left")}</button><button class="presentation-arrow presentation-next" type="button" data-photo-next aria-label="${esc(t.next)}">${await icon("arrow-right")}</button><form method="dialog" class="presentation-close"><button type="submit" aria-label="${esc(t.closePhotos)}" autofocus>${await icon("x")}</button></form></div><div class="photo-footer"><p data-photo-caption></p><p role="status" aria-live="polite" data-photo-status></p></div></div></dialog>`
        : "";
      const html = `<!doctype html><html lang="${lang.code}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>${esc(t.title)} · ${esc(person)}</title><meta name="description" content="${esc(t.intro)}"><link rel="canonical" href="${canonical}">${languages.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${new URL(pathFor(l.code), site.url).href}">`).join("")}<link rel="alternate" hreflang="x-default" href="${new URL(pathFor("ru"), site.url).href}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(t.title)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${site.url}${shared.slides[0].image}"><meta name="referrer" content="strict-origin-when-cross-origin"><link rel="icon" href="${base}assets/avatar.png"><script>${themeScript}</script><link rel="stylesheet" href="${assets["style.css"]}"><script src="${assets["client.js"]}" defer></script><script src="${assets["talk-reader.js"]}" defer></script></head><body class="talk-reader-page"><noscript><style>.talk-header .icon-button{display:none}</style></noscript><a class="skip" href="#main">${esc(t.skip)}</a><header class="header wrap talk-header"><a class="identity" href="${home}">${esc(person)}</a><nav class="nav"><a class="talk-back" href="${home}" aria-label="${esc(t.back)}" title="${esc(t.back)}">${await icon("arrow-left")}<span>${esc(t.back)}</span></a><div class="nav-tools"><details class="language-menu"><summary class="language" aria-label="${esc(t.selectLanguage)}"><span class="language-code">${lang.short}</span>${await icon("caret-down", "language-caret")}</summary><nav class="language-options" aria-label="${esc(t.selectLanguage)}">${languages.map((l) => `<a href="${pathFor(l.code)}" lang="${l.code}" hreflang="${l.code}" data-language="${l.code}" ${l.code === lang.code ? 'aria-current="page"' : ""}>${l.name}</a>`).join("")}</nav></details><button class="icon-button" type="button" data-theme-toggle aria-label="${esc(t.theme)}" aria-pressed="false">${await icon("moon", "moon")}${await icon("sun", "sun")}</button></div></nav></header><main class="wrap talk-page" id="main"><p class="talk-meta">${esc(t.intro)}</p><h1 class="talk-title">${esc(t.title)}</h1><p class="talk-notice">${esc(t.notice)}</p><p class="talk-notice">${esc(t.imageNote)}</p><div class="talk-source-links">${shared.video ? `<a class="text-link" href="${videoAt(shared.start)}">${esc(t.allVideo)}${await icon("arrow-up-right")}</a>` : ""}<a class="text-link" href="${base}${shared.pdf}">${esc(t.pdf)}${await icon("arrow-down")}</a>${shared.photos?.length ? `<a class="text-link" href="#photos">${esc(t.photosTitle)}${await icon("arrow-down")}</a>` : ""}</div><details class="talk-toc"><summary>${esc(t.contents)}</summary><nav aria-label="${esc(t.contents)}">${t.slides.map((slide, i) => `<a href="#slide-${i + 1}"><span>${i + 1}</span>${esc(slide.title)}</a>`).join("")}${questions ? `<a href="#questions">${esc(t.questionsTitle)}</a>` : ""}</nav></details><div data-talk-reader data-slide-status="${esc(t.slideStatus)}"><div class="reader-toolbar"><div class="reader-layout" role="group" aria-label="${esc(t.layoutLabel)}"><label><input type="radio" name="reader-layout" value="side" checked><span>${esc(t.layoutSide)}</span></label><label><input type="radio" name="reader-layout" value="wide"><span>${esc(t.layoutWide)}</span></label></div><div class="reader-controls" data-reader-controls hidden><button class="reader-button" type="button" data-reader-prev aria-label="${esc(t.previous)}">${await icon("arrow-left")}<span>${esc(t.previous)}</span></button><div class="reader-select-wrap"><label class="visually-hidden" for="reader-slide">${esc(t.selectSlide)}</label><select id="reader-slide" data-reader-select>${t.slides.map((slide, i) => `<option value="${i}">${i + 1} / ${shared.slides.length} · ${esc(slide.title)}</option>`).join("")}</select>${await icon("caret-down", "reader-select-caret")}</div><button class="reader-button" type="button" data-reader-next aria-label="${esc(t.next)}"><span>${esc(t.next)}</span>${await icon("arrow-right")}</button><p class="visually-hidden" role="status" aria-live="polite" data-reader-status></p></div></div>${articles.join("")}</div>${gallery}${questions ? `<section class="talk-questions" id="questions" aria-labelledby="questions-title"><h2 id="questions-title">${esc(t.questionsTitle)}</h2>${questions}</section>` : ""}</main><footer class="footer wrap"><a href="${home}">${esc(t.back)}</a><a href="https://github.com/Sipaha/about">GitHub ↗</a></footer><dialog class="presentation-view" aria-label="${esc(t.presentationLabel)}"><div class="presentation-shell"><div class="presentation-stage"><button class="presentation-slide" type="button" aria-label="${esc(t.next)}" data-presentation-slide><img alt="" width="${shared.width ?? 1200}" height="${shared.height ?? 900}"></button><button class="presentation-arrow presentation-previous" type="button" data-presentation-prev aria-label="${esc(t.previous)}">${await icon("arrow-left")}</button><button class="presentation-arrow presentation-next" type="button" data-presentation-next aria-label="${esc(t.next)}">${await icon("arrow-right")}</button><form method="dialog" class="presentation-close"><button type="submit" aria-label="${esc(t.closePresentation)}" autofocus>${await icon("x")}</button></form></div><section class="presentation-text" tabindex="0" aria-label="${esc(t.transcript)}"><h2 data-presentation-title></h2><div data-presentation-text></div></section></div></dialog>${photoViewer}</body></html>`;
      const relative = (lang.code === "ru" ? "" : `${lang.code}/`) + folder;
      await mkdir(new URL(relative, out), { recursive: true });
      await writeFile(new URL(relative + "index.html", out), html);
      urls.push(canonical);
    }
  }
  return urls;
}

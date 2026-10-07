import { readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import QRCode from "qrcode";
import { validateSite } from "../src/validate.mjs";
import { content } from "../src/content.mjs";
import { languages, pagePath, languageBootstrap } from "../src/languages.mjs";

const site = validateSite(
  JSON.parse(
    await readFile(new URL("../src/site.json", import.meta.url), "utf8"),
  ),
);
const out = new URL("../dist/", import.meta.url);
const root = new URL("../", import.meta.url);
const esc = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const base = new URL(site.url).pathname;
const iconCache = new Map();
async function icon(name, extra = "") {
  if (!/^[a-z-]+$/.test(name)) throw new Error("Invalid icon name");
  if (!iconCache.has(name))
    iconCache.set(
      name,
      (
        await readFile(
          new URL(
            `node_modules/@phosphor-icons/core/assets/regular/${name}.svg`,
            root,
          ),
          "utf8",
        )
      ).replace(
        /<svg[^>]*>/,
        '<svg class="icon" viewBox="0 0 256 256" aria-hidden="true" focusable="false">',
      ),
    );
  return iconCache.get(name).replace('class="icon"', `class="icon ${extra}"`);
}
await rm(out, { recursive: true, force: true });
await mkdir(new URL("en/", out), { recursive: true });
await cp(new URL("public/", root), out, { recursive: true });
await mkdir(new URL("assets/", out), { recursive: true });
for (const file of ["style.css", "client.js"])
  await cp(new URL(`src/${file}`, root), new URL(`assets/${file}`, out));
for (const subset of ["latin", "cyrillic"])
  await cp(
    new URL(
      `node_modules/@fontsource-variable/manrope/files/manrope-${subset}-wght-normal.woff2`,
      root,
    ),
    new URL(`assets/manrope-${subset}-wght-normal.woff2`, out),
  );
for (const w of site.wallets) {
  // A bare public address works in wallet scanners without an external QR service.
  await writeFile(
    new URL(`assets/qr-${w.id}.svg`, out),
    await QRCode.toString(w.address, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 4,
      color: { dark: "#20232aff", light: "#ffffffff" },
    }),
  );
}
const themeScript = `try{const t=localStorage.getItem('about-theme');document.documentElement.dataset.theme=t==='dark'||t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch{document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}`;
for (const meta of languages) {
  const lang = meta.code;
  const t = content[lang];
  const pageUrl = site.url + (lang === "ru" ? "" : `${lang}/`);
  const person = lang === "ru" ? site.owner.nameRu : site.owner.name;
  const wallets = await Promise.all(
    site.wallets.map(
      async (
        w,
        index,
      ) => `<div class="wallet-option"><input class="wallet-radio" type="radio" name="wallet" id="choose-${w.id}" value="${w.id}" ${index === 0 ? "checked" : ""}><label class="wallet-choice" for="choose-${w.id}">${esc(w.coin)}<span>${esc(w.network)}</span></label><section class="wallet" aria-labelledby="wallet-${w.id}">
    <div class="wallet-heading"><span class="coin-icon">${await icon(w.coin === "BTC" ? "currency-btc" : w.coin === "ETH" ? "currency-eth" : "wallet")}</span><div><div class="coin-name" id="wallet-${w.id}">${esc(w.name)} <span aria-hidden="true">/</span> ${esc(w.coin)}</div><div class="network">${t.network}: <strong>${esc(w.network)}</strong></div></div></div>
    <div class="qr-row"><div class="qr-frame"><img src="${base}assets/qr-${w.id}.svg" alt="${t.qr}: ${esc(w.coin)}, ${esc(w.network)}" width="138" height="138"></div><div class="qr-help"><p>${t.instruction}</p><strong>${t.check}</strong></div></div>
    <label class="address-label" for="address-${w.id}">${t.address} (${esc(w.coin)}, ${esc(w.network)})</label>
    <textarea class="address" id="address-${w.id}" rows="2" readonly spellcheck="false" autocomplete="off" ${w.coin === "BTC" ? `aria-describedby="note-${w.id}"` : ""}>${esc(w.address)}</textarea>
    <button class="copy" type="button" data-copy data-success="${t.copied}" data-error="${t.copyError}">${await icon("copy")}<span>${t.copy}</span></button>
    <p class="copy-status" role="status" aria-live="polite" aria-atomic="true"></p>
    ${w.coin === "BTC" ? `<p class="network-note" id="note-${w.id}">${t.bitcoin}</p>` : ""}
  </section></div>`,
    ),
  );
  const projects = await Promise.all(
    site.projects.map(
      async (p) =>
        `<a class="project" href="${esc(p.url)}"><span class="project-icon">${await icon(p.icon)}</span><h3>${esc(p.name)}</h3><p>${esc(t.projectDescriptions?.[site.projects.indexOf(p)] ?? p[lang])}</p>${await icon("arrow-up-right")}</a>`,
    ),
  );
  const html = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>${t.title}</title><meta name="description" content="${t.description}"><link rel="canonical" href="${pageUrl}">${languages.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${site.url + (l.code === "ru" ? "" : `${l.code}/`)}">`).join("")}<link rel="alternate" hreflang="x-default" href="${site.url}"><meta property="og:type" content="website"><meta property="og:title" content="${t.title}"><meta property="og:description" content="${t.description}"><meta property="og:url" content="${pageUrl}"><meta property="og:image" content="${site.url}assets/portrait.jpg"><meta property="og:locale" content="${meta.og}"><meta name="referrer" content="strict-origin-when-cross-origin"><link rel="icon" href="${base}assets/avatar.png"><script>${languageBootstrap({ base, storageKey: "about-language", codes: languages.map((l) => l.code) })}</script><script>${themeScript}</script><link rel="stylesheet" href="${base}assets/style.css"><script src="${base}assets/client.js" defer></script></head>
<body><a class="skip" href="#main">${t.skip}</a>
<header class="header wrap"><a class="identity" href="${esc(site.owner.github)}"><img src="${base}assets/portrait-small.jpg" alt="" width="38" height="38"><span>${esc(person)}</span></a><nav class="nav" aria-label="${t.navigation}"><a class="nav-projects" href="#projects">${t.projectsNav}</a><a class="nav-support" href="#support">${t.supportNav}</a><div class="nav-tools"><details class="language-menu"><summary class="language" aria-label="${t.languageLabel}" title="${t.languageLabel}">${meta.short}<span aria-hidden="true">⌄</span></summary><nav class="language-options" aria-label="${t.languageLabel}">${languages.map((l) => `<a href="${pagePath(l.code, base)}" lang="${l.code}" hreflang="${l.code}" data-language="${l.code}" ${l.code === lang ? 'aria-current="page"' : ""}>${l.name}</a>`).join("")}</nav></details><button class="icon-button" type="button" data-theme-toggle aria-label="${t.theme}" aria-pressed="false">${await icon("moon", "moon")}${await icon("sun", "sun")}</button></div></nav></header>
<main id="main" class="wrap">
<section class="profile-hero" aria-labelledby="profile-title"><div class="intro"><p class="greeting">${t.intro}</p><h1 id="profile-title">${t.headline}</h1><p class="lead">${t.lead}<br>${t.leadSecond}</p><a class="text-link" href="${esc(site.owner.github)}">${await icon("github-logo")} ${t.profile}${await icon("arrow-up-right")}</a></div><div class="profile-mark"><img src="${base}assets/portrait.jpg" alt="${esc(person)}" width="192" height="192"><span>@${esc(site.owner.handle)}</span></div></section>
<section class="about-section" aria-labelledby="about-title"><h2 id="about-title">${t.about}</h2><p>${t.aboutText}</p><p>${t.valuesText}</p></section>
<section class="projects" id="projects" aria-labelledby="projects-title"><div class="section-head"><h2 id="projects-title">${t.work}</h2><a class="text-link" href="${site.owner.github}?tab=repositories"><span>${t.allProjects}</span>${await icon("arrow-up-right")}</a></div><p class="section-lead">${t.workLead}</p><div class="project-list">${projects.join("")}</div></section>
<section class="contact-section" id="contact" aria-labelledby="contact-title"><h2 id="contact-title">${t.contact}</h2><div class="contact-details"><a class="contact-email" href="mailto:${esc(site.owner.email)}">${esc(site.owner.email)}</a><p>${t.contactText}</p></div></section>
<div class="support-layout" id="support"><div class="support-context"><h2>${t.support}</h2><p>${t.supportLead}</p><section class="purpose"><h3>${t.purpose}</h3><p>${t.purposeText}</p></section><section class="help"><h3>${t.other}</h3><p>${t.otherText}</p></section></div>
<section class="support" aria-label="${t.support}">${site.boosty ? `<a class="boosty" href="${esc(site.boosty)}">${t.boosty}${await icon("arrow-up-right")}</a><p class="boosty-note">${t.boostyText}</p>${wallets.length ? `<p class="crypto-label">${t.crypto}</p>` : ""}` : ""}<fieldset class="wallet-picker"><legend class="visually-hidden">${t.support}</legend>${wallets.join("")}</fieldset><p class="optional">${t.optional}</p><noscript><style>.copy,.icon-button,.copy-status{display:none}</style><span class="no-js">${t.instruction}</span></noscript></section></div></main>
<footer class="footer wrap"><p>${t.footer}</p><a href="https://github.com/Sipaha/about">${t.source} ↗</a></footer></body></html>`;
  if (lang !== "ru") await mkdir(new URL(`${lang}/`, out), { recursive: true });
  await writeFile(
    new URL(lang === "ru" ? "index.html" : `${lang}/index.html`, out),
    html,
  );
}
await writeFile(new URL(".nojekyll", out), "");
await writeFile(
  new URL("sitemap.xml", out),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${languages.map((l) => `<url><loc>${site.url + (l.code === "ru" ? "" : `${l.code}/`)}</loc></url>`).join("")}</urlset>`,
);
console.log(
  `Built ${languages.length} localized static pages; ${site.wallets.length} verified-format wallet(s), ${site.boosty ? 1 : 0} Boosty link. No external runtime requests.`,
);

# Pavel Simonov · About

Multilingual personal website for [Pavel Simonov / Sipaha](https://github.com/Sipaha).
The page introduces the developer, presents selected projects, conference talks and a contact route,
and includes optional donation details in a secondary section (`#support`).

The profile introduces Pavel as a systems architect and developer at Citeck
(since 2015; systems architecture since 2018). General biography and product
principles take priority over individual technical achievements: free software,
no tracking, optional cloud use, and speed. AI assists design, implementation,
and testing; donations help fund these tools. The owner-approved public contact
is sipahabk@gmail.com, with no promise to answer every message. The page does not
advertise job seeking. Keep this content equivalent in all supported languages.
Desktop and tablet hero columns align at the top, with the portrait level with
the professional title. The introduction has a deliberate line break after the professional title.
“Для меня программирование” begins the next line; narrower screens can wrap
naturally; Russian conjunctions stay with the following word.

Featured projects are SPK Ocular, SPK MM Client and
Citeck Launcher (https://citeck.github.io/citeck-launcher/). The Citeck name in
the biography links to https://www.citeck.ru/.
SPK Ocular links to its product website: https://sipaha.github.io/spk-ocular/.
SPK MM Client links to its product website: https://sipaha.github.io/spk-mm-client/.
Project descriptions address a broad audience and avoid possessives such as “my”.
The footer says “Free software for everyone” and omits payment-method and
privacy slogans. Boosty remains a possible future option awaiting a public profile link. Outwall is omitted at the owner’s request.
The Mattermost repository is public; anonymous access was verified on 2026-10-06.
The support section explicitly names its purpose: quality free software available
to everyone. Avoid references such as “this idea” that require reading earlier sections.

## Conference talks

The `#conferences` section follows projects. A full-width divider and consistent
section padding separate conferences from contact in both themes and on mobile.
Each talk title links to its localized reader. The home page has no separate
reader, video or download action row; PDF downloads and video links live on
the talk pages.
Entries are ordered newest first and include the owner’s
2023 Город IT talk, “Records API: rethinking GraphQL for a low-code platform”.
The video link preserves the supplied 33:39 start (`t=2019`). The original
36-page Russian presentation is hosted locally as
`public/assets/records-api-gorod-it-2023.pdf`, without modifying its contents.
Titles and action labels are localized in all eight languages; every locale
identifies the video and slides as Russian. YouTube is a plain outbound link,
with no embed, remote thumbnail, tracking or external runtime request.
Add entries to `src/site.json` under `conferences` and provide the corresponding
title key in every locale dictionary. A missing title or PDF blocks the build.

## Talk reader and transcripts

The conference entry links to a static reader at
`/about/talks/gorod-it-2023/`; the other seven languages use the corresponding
`/about/{code}/talks/gorod-it-2023/` route. Each version contains all 36 original
slide images, the edited speech text, shared code examples and four audience
questions. The original slides stay in Russian; the speech text is translated.
No translated audio or rebuilt localized slide images are implied.

With JavaScript, Previous/Next, the slide selector, keyboard arrows in the
controls and the contents menu select one slide. `#slide-N` deep links survive
language switching and reloads. Controls remain visible while reading a slide. Clicking the slide or choosing
large-slide mode opens a native dialog covering the browser viewport. The whole
slide fits above a scrollable transcript/code panel; Previous/Next buttons sit
at the screen edges. Clicking the slide or pressing Right advances, Left goes
back; the endpoints do not wrap. Escape and the close button return to the page
and focus its current slide. The ordinary site navigation is outside the dialog.
Without JavaScript or dialog support, native layout radios retain an in-page
large-slide/text layout with viewport-height limits and sequential static reading.
The overlay opens only on interaction, not automatically on reload.
The reader uses locally hosted Noto Sans
type at 17px on desktop and 16px on mobile for speech and questions, with a
bundled, clearly visible selector caret; Chinese and Japanese use system CJK
font fallback; the native select remains keyboard accessible.
Without JavaScript, all 36 slide/text pairs appear sequentially. The original
PDF and YouTube links remain ordinary links; there are no embeds or remote fonts.
The home and reader each have their own locale-aware language destinations,
canonical/hreflang links and sitemap entries.

`src/talks/gorod-it-2023/source.json` records the provenance and boundaries of
this speaker’s segment (2019–3338 seconds, speech from 2047) and questions
(3342–3755 seconds). It points to `ru.json` as the single edited Russian text;
raw, error-filled automatic captions are not duplicated in the repository or
served as a browser asset. The edited Russian text removes
fillers and repetition, repairs technical names against the PDF and explicitly
marks two unclear passages instead of inventing speech. Slide-supported explanations
are included; this is not a verbatim transcript checked against the audio. Translations preserve
the Russian paragraph structure, substantive content, API identifiers and those
uncertainty markers; they are not independently native-speaker certified.
Timestamps point to the corresponding topic, not frame-exact slide transitions.
The text preserves the 2023 context rather than claiming current platform behavior.

Locale dictionaries live beside `shared.json`, which owns slide image paths,
video timestamps and code. JSON snippets repair only obvious missing commas or
closing braces in the source slides; fields, values and original slide images
are unchanged. `scripts/build-talk.mjs` generates the eight reader pages.
The 36 WebP images are faithful 1200×900 renders of the owner-provided PDF,
generated with Poppler and encoded at quality 90. The original PDF is retained.
`scripts/verify-all.mjs` runs home verification and the reader matrix. Reader
checks include every slide, images, technical expression parity, code layout,
keyboard navigation, deep links, language continuity, no-JS reading, local-only
runtime requests, original PDF delivery and WCAG AA.

## Languages and shared direction

Eight complete website languages: Russian, English, simplified Chinese, Spanish,
German, French, Brazilian Portuguese and Japanese. Russian stays at the canonical
root for URL compatibility; others use `/about/{code}/`. The root uses an explicit
saved choice, then ordered browser languages, then English as fallback. Direct
localized URLs are never redirected. Bots and automated audits retain the requested
page. Traditional Chinese is not silently presented as simplified Chinese.

The native-language menu works without JavaScript. Its chevron is a bundled SVG
aligned with the language code rather than a font-dependent text glyph. With JavaScript it remembers
choices, preserves query/fragment and supports Escape/outside-click dismissal.
Storage denial does not prevent navigation: an explicit `?lang=ru` preserves a
manual Russian choice on the legacy root when preference storage is unavailable. Every page has canonical/hreflang
metadata and a sitemap entry. No translation service is contacted at runtime.

Translations were authored and reviewed against approved RU/EN facts, technical
names, biography dates and payment instructions; they have not been independently
certified by native speakers. Key/shape parity and browser checks catch omissions
and rendering problems, not every stylistic issue. Persian is deferred until an
adequate terminology and language-review process is available; this is not a claim
that AI necessarily translates every Persian text poorly. Do not publish a language
with known unresolved mistranslations to inflate the selector. See the
[translation policy](docs/localization.md).

[Shared SPK principles](docs/spk-principles.md) record the owner's language-accessibility
direction. [Market research](docs/markets-2026-10-06.md) separates source evidence
from proposed outreach priorities. These documents authorize no app changes or posts.

Canonical URL: **https://sipaha.github.io/about/**; English: **https://sipaha.github.io/about/en/**.
Repository: **https://github.com/Sipaha/about**. The local Solution directory is
still `donate`; this does not affect the repository or public site URL.

GitHub Pages must use **GitHub Actions** as its source. Publishing requires that setting to be enabled.
The owner confirmed GitHub Pages is working.

## Content and payment details

Edit **`src/site.json`** to change the owner, projects, wallet addresses, or Boosty
profile. Edit `src/content.mjs` for Russian and English copy. There is no runtime
API, analytics, wallet connection, checkout, or private-key handling. The owner-provided portrait is served locally as an optimized 768px JPEG for the
hero and social preview. The header contains the owner’s name without a photo. The original GitHub avatar remains
the favicon. The portrait displays at 288px on desktop, 224px on tablets and 128px on mobile; fonts and QR images
are served locally too.

Owner-approved methods: BTC on Bitcoin (ordinary on-chain payments), USDT on
TON, USDT on TRON, and ETH on Ethereum. Exact addresses are in `src/site.json`.
The supplied TON mainnet CRC16 and TRON Base58Check checks passed; Ethereum
syntax is validated by the build. Checks do not prove wallet ownership.
Each method displays its network explicitly. A native radio selector shows one
wallet at a time, including its network, exact address and QR code. It works
without JavaScript and supports keyboard navigation. Network names appear in
the selector, wallet heading and address label; only Bitcoin has an additional
on-chain/Lightning clarification beneath the copy button. Copy feedback changes the fixed-height button label for three seconds, with
an accessible live region inside the button. No separate status row is reserved.
Clipboard denial selects the address and shows a short manual-copy label; the
full explanation is available in the button tooltip.

Lightning remains on hold. Toncoin/GRAM and Boosty remain unconfigured.
Never substitute sample addresses or create payment accounts on the owner's behalf.

Each wallet has `id`, `coin`, `name`, `network`, and `address`. Use an explicit
network name such as `Ethereum`, `Bitcoin`, `TON`, or `TRON`. The build validates
allowed coin/network combinations and Bitcoin Bech32/Bech32m checksums. Other
networks have syntax checks only; ownership and network-specific checksums still
need independent verification before publishing new addresses. The build cannot
prove ownership of any wallet. QR codes are generated from the exact address;
the browser checks decode the rendered codes and compare them with configuration.

A non-null `boosty` must be the owner’s actual HTTPS profile on `boosty.to`.
A future Boosty option on this personal site does not change any individual
project’s funding policy. Ocular retains voluntary cryptocurrency-only funding.

## Local development

Node.js 22 or newer:

```sh
npm ci
npm test
npm run build
npm run preview
# http://127.0.0.1:4317/about/
```

CSS and browser scripts use content-hashed filenames in every generated home
and reader page. A new page therefore requests the matching assets after an
update, even when a previous stylesheet is cached. Browser verification includes
a warm-cache upgrade, not only clean sessions. Legacy asset URLs remain available
for previously opened pages.

`PORT` changes the loopback preview port. Build output is `dist/`; do not hand-edit
it. This is a static HTML/CSS site with a small progressive-enhancement script for
theme selection and copying. Donation addresses, QR codes, and language links
remain usable with JavaScript disabled. Clipboard failure selects the full
address for manual copying. User-selected theme is stored locally; otherwise the
system theme is used.

For this Solution, keep scratch output and browser profiles inside its `.tmp`:

```sh
mkdir -p ../.tmp/about
export TMPDIR="$(realpath ../.tmp/about)"
npm run verify
# In another terminal while npm run preview is running:
npm run audit
```

`npm run verify` starts and stops its own preview server and verifies all eight languages,
light/dark themes, widths 375/768/1440, exact clipboard contents, QR decoding,
WCAG AA checks with axe, no external runtime requests, theme persistence,
language navigation, clipboard denial, JavaScript-disabled use, and 320px layout.
Screenshots and results default to `../.tmp/about/verify`.
Set `CHROME_PATH` if Chrome is not at `/usr/bin/google-chrome`.
`ABOUT_SCRATCH` overrides output; `SITE_URL` selects the Lighthouse target.

## Publish to GitHub Pages

1. Push this repository to `Sipaha/about`, branch `main`.
2. Open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Run the **Verify and deploy personal site** workflow (or push a change).
4. Verify both public URLs and a small real payment before broadly promoting them.

Pull requests run checks without deployment. Main pushes build, verify, upload a
Pages artifact, and deploy through a restricted `github-pages` environment job.
No payment secrets or GitHub personal tokens are needed by the site or workflow.
Change `url` in `src/site.json` if hosting changes; asset paths, canonical URLs,
language links, and the sitemap follow it.

## Optional future repository links

Use `integrations/FUNDING.yml` as `.github/FUNDING.yml` in each personal repository:

```yaml
custom: ["https://sipaha.github.io/about/#support"]
```

If a repository already has funding configuration, preserve its other funding
providers and merge the custom URL (GitHub supports at most four custom URLs).
Add a README link using `integrations/README-snippet.md`. Do not duplicate wallet
addresses in those repositories. Activate public links once the site is live.
Repository integration is on hold at the owner’s request. Do not change other
projects or publish funding links until explicitly asked. Previously prepared
local integration edits have been removed.

For automatic Sponsor buttons on all eligible personal repositories, the same
funding file can live in a public **`Sipaha/.github`** repository. Existing
repository-specific funding files override that default and must be updated
separately. This repository provides the template; it does not silently create
another GitHub repository or change unrelated project settings.

## Design and assets

Profile-first page: introduction, about, projects, contact, then optional support.
On desktop, the contact heading occupies a narrow column; email and invitation
are grouped together beside it. On mobile, the heading and details stack. Keep
the invitation attached to the email rather than in a distant separate column.
Neutral gray surfaces and a restrained blue accent with a responsive layout. Design
variance 4, motion intensity 2, visual density 4. Auto light/dark theme with manual
override. Native CSS; no UI framework is needed for a static personal page.
Manrope is self-hosted. Phosphor icons are bundled inline; Bitcoin QR codes are
functional images generated locally. No fabricated photos, testimonials, stats,
or balances. `THIRD_PARTY_NOTICES.md` records asset provenance and licenses.

The 2024 Город IT talk, “Distributed transactions with guaranteed consistency:
myth or reality?”, is available at `talks/gorod-it-2024/` in all eight languages.
Its 23 Russian slides, original PDF and six owner-provided photographs are
hosted locally. The 2023 reader also has an owner-provided conference photograph.
Each reader has a collapsed photo gallery after the slides, with localized captions
and links to larger images. With JavaScript, photos open in a native modal with
Previous/Next buttons, arrow keys and click-on-photo navigation; navigation wraps.
Escape or Close returns focus to the opening thumbnail without changing the selected
slide. The single-photo 2023 gallery disables navigation. Without JavaScript or
dialog support, ordinary image links and the native gallery remain usable. There is no video or transcript: the reader explicitly identifies
its text as a reconstruction from the presentation, draft and announcement.
The reconstructed text uses conversational speaker wording. Thread reuse and the
Zookeeper subscription registry are checked against source revisions preceding
the talk; provenance and source limitations are recorded separately in metadata; no timestamps or audience
questions are invented. See [reconstruction provenance](docs/gorod-it-2024.md).
The reader generator supports each configured conference and optional video/questions.

# Pavel Simonov · About

Multilingual personal website for [Pavel Simonov / Sipaha](https://github.com/Sipaha).
The page introduces the developer, presents selected projects and a contact route,
and includes optional donation details in a secondary section (`#support`).

The profile introduces Pavel as a systems architect and developer at Citeck
(since 2015; systems architecture since 2018). General biography and product
principles take priority over individual technical achievements: free software,
no tracking, optional cloud use, and speed. AI assists design, implementation,
and testing; donations help fund these tools. The owner-approved public contact
is sipahabk@gmail.com, with no promise to answer every message. The page does not
advertise job seeking. Keep this content equivalent in all supported languages.
The introduction has a deliberate line break after the professional title.
“Для меня программирование” begins the next line; narrower screens can wrap
naturally; Russian conjunctions stay with the following word.

Featured projects are SPK Ocular, SPK MM Client (`Sipaha/spk-mm-client`), and SPK Mail.
SPK Ocular links to its product website: https://sipaha.github.io/spk-ocular/.
Project descriptions address a broad audience and avoid possessives such as “my”.
The footer says “Free software for everyone” and omits payment-method and
privacy slogans. Boosty remains a possible future option awaiting a public profile link. Outwall is omitted at the owner’s request.
The Mattermost repository is public; anonymous access was verified on 2026-10-06.
The support section explicitly names its purpose: quality free software available
to everyone. Avoid references such as “this idea” that require reading earlier sections.

## Languages and shared direction

Eight complete website languages: Russian, English, simplified Chinese, Spanish,
German, French, Brazilian Portuguese and Japanese. Russian stays at the canonical
root for URL compatibility; others use `/about/{code}/`. The root uses an explicit
saved choice, then ordered browser languages, then English as fallback. Direct
localized URLs are never redirected. Bots and automated audits retain the requested
page. Traditional Chinese is not silently presented as simplified Chinese.

The native-language menu works without JavaScript. With JavaScript it remembers
choices, preserves query/fragment and supports Escape/outside-click dismissal.
Storage denial does not prevent navigation. Every page has canonical/hreflang
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

GitHub Pages must use **GitHub Actions** as its source. The previous deployment
was blocked by disabled Pages; publishing requires that setting to be enabled.
On 2026-10-06, [run 37483024816](https://github.com/Sipaha/about/actions/runs/37483024816)
verified the eight-language build successfully, but deployment returned HTTP 404
and requested that Pages be enabled. The public repository API still reported
`has_pages: false`. The site is therefore not claimed publicly live.

## Content and payment details

Edit **`src/site.json`** to change the owner, projects, wallet addresses, or Boosty
profile. Edit `src/content.mjs` for Russian and English copy. There is no runtime
API, analytics, wallet connection, checkout, or private-key handling. The owner’s
public GitHub avatar is stored locally; fonts and QR images are served locally too.

Owner-approved methods: BTC on Bitcoin (ordinary on-chain payments), USDT on
TON, USDT on TRON, and ETH on Ethereum. Exact addresses are in `src/site.json`.
The supplied TON mainnet CRC16 and TRON Base58Check checks passed; Ethereum
syntax is validated by the build. Checks do not prove wallet ownership.
Each method displays its network explicitly.

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

`PORT` changes the loopback preview port. Build output is `dist/`; do not hand-edit
it. This is a static HTML/CSS site with a small progressive-enhancement script for
theme selection and copying. Donation addresses, QR codes, and language links
remain usable with JavaScript disabled. Clipboard failure selects the full
address for manual copying. User-selected theme is stored locally; otherwise the
system theme is used.

For this Solution, keep scratch output and browser profiles inside its `.agents/tmp`:

```sh
export TMPDIR="$(realpath ../.agents/tmp/about)"
mkdir -p "$TMPDIR"
npm run verify
# In another terminal while npm run preview is running:
npm run audit
```

`npm run verify` starts and stops its own preview server and verifies all eight languages,
light/dark themes, widths 375/768/1440, exact clipboard contents, QR decoding,
WCAG AA checks with axe, no external runtime requests, theme persistence,
language navigation, clipboard denial, JavaScript-disabled use, and 320px layout.
Screenshots and results default to `../.agents/tmp/about/verify`.
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

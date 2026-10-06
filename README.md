# Pavel Simonov · About

Bilingual personal website for [Pavel Simonov / Sipaha](https://github.com/Sipaha).
The page introduces the developer, presents selected projects and a contact route,
and includes optional donation details in a secondary section (`#support`).

The profile introduces Pavel as a systems architect and developer at Citeck
(since 2015; systems architecture since 2018). General biography and product
principles take priority over individual technical achievements: free software,
no tracking, optional cloud use, and speed. AI assists design, implementation,
and testing; donations help fund these tools. The owner-approved public contact
is sipahabk@gmail.com, with no promise to answer every message. The page does not
advertise job seeking. Keep this content equivalent in Russian and English.

Canonical URL: **https://sipaha.github.io/about/**; English: **https://sipaha.github.io/about/en/**.
Repository: **https://github.com/Sipaha/about**. The local Solution directory is
still `donate`; this does not affect the repository or public site URL.

GitHub Pages must use **GitHub Actions** as its source. The previous deployment
was blocked by disabled Pages; publishing requires that setting to be enabled.

## Content and payment details

Edit **`src/site.json`** to change the owner, projects, wallet addresses, or Boosty
profile. Edit `src/content.mjs` for Russian and English copy. There is no runtime
API, analytics, wallet connection, checkout, or private-key handling. The owner’s
public GitHub avatar is stored locally; fonts and QR images are served locally too.

Only the owner-provided Bitcoin mainnet address is currently configured:

```text
bc1q7flpdhcm59jdz83gfzk0rf5gc36k32q0td6m6v
```

BTC uses ordinary on-chain payments. Lightning is deliberately on hold because
the owner does not want to periodically claim payments. ETH, TON/Gram, USDT, and
Boosty remain unconfigured until the owner supplies their public addresses or
profile link. Never substitute sample addresses or create payment accounts on the
owner’s behalf. Adding a non-empty method to the configuration renders it in both
languages; absent methods are not advertised.

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

`npm run verify` starts and stops its own preview server and verifies RU/EN,
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
Neutral gray surfaces and a restrained blue accent with a responsive layout. Design
variance 4, motion intensity 2, visual density 4. Auto light/dark theme with manual
override. Native CSS; no UI framework is needed for a static personal page.
Manrope is self-hosted. Phosphor icons are bundled inline; Bitcoin QR codes are
functional images generated locally. No fabricated photos, testimonials, stats,
or balances. `THIRD_PARTY_NOTICES.md` records asset provenance and licenses.

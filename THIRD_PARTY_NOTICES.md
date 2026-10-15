# Third-party assets

- **Manrope variable font**: @fontsource-variable/manrope, SIL Open Font License
  1.1. The Latin and Cyrillic WOFF2 subsets are copied from the installed package.
- **Noto Sans variable font**: @fontsource-variable/noto-sans, SIL Open Font
  License 1.1. Reader Latin and Cyrillic WOFF2 subsets are hosted locally.
- **Phosphor icons**: @phosphor-icons/core, MIT. Selected SVGs are included inline
  at build time without modification to their paths.
- **GitHub profile avatar**: public profile image for Sipaha, downloaded from
  https://avatars.githubusercontent.com/u/3995047?v=4&s=192 for this personal site.
  The avatar is retained as an asset and is owner profile content, not covered by
  the font or icon licenses.
- **Portrait**: supplied by the owner as `photo_about.png`; optimized JPEG
  derivatives are served locally. The portrait is owner-provided content and
  is not covered by the font or icon licenses.
- **QRCode**: qrcode, MIT. Generates local QR images from public wallet addresses.
- **bech32**: MIT. Validates configured Bitcoin donation addresses.

Dependency versions and provenance are locked in package-lock.json. Dependency
license texts are in their installed packages; copies for assets shipped with the
site are distributed under public/licenses/.

- **Город IT 2023 slides**: owner-supplied `2.pdf`, retained unchanged as the
  original presentation. The reader uses faithful raster renders of its 36
  pages. Embedded images and logos retain their original provenance; no new
  license is asserted for them. The talk text is an edited rendering of the
  speaker’s automatic Russian captions with translations, not verbatim audio
  certification.

- **Город IT 2024 slides and photograph**: owner-supplied
  `Симонов Павел Город ИТ 110924.pdf` and `image (1).png`. The original PDF is
  unchanged; slide renders and the photograph are local WebP derivatives.
  Embedded logos and photographs retain their original provenance; no new
  license is asserted. The text is an explicitly marked reconstruction based
  on slides, draft and announcement, translated into eight languages.

- **Additional conference photographs**: owner-supplied `gorodit_2023.jpg`
  and `gorodid_2024-0.jpg` through `gorodid_2024-4.jpg`. JPEG files are copied
  unchanged, with local WebP thumbnails that preserve the full frame. No new
  license is asserted.

## Boosty brand mark

`public/assets/boosty-mark.svg` is the unmodified color brand mark from
[Boosty’s official brand assets](https://boosty.to/app/brand), downloaded from
https://static.boosty.to/static/brand_mark_svg.zip (`SVG/Color.svg`).
Used to identify the owner’s outbound Boosty profile; Boosty retains its trademark rights.

- **VK brand icon**: Simple Icons, CC0-1.0, from
  https://github.com/simple-icons/simple-icons/blob/develop/icons/vk.svg.
  Bundled in `public/assets/vk.svg`; license in `public/licenses/Simple-Icons-LICENSE.md`.
  Brand marks remain the property of their respective owners. Telegram and X
  use the existing locally bundled Phosphor icons.

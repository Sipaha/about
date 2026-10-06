# Localization quality

The eight complete website languages are Russian, English, simplified Chinese,
Spanish, German, French, Brazilian Portuguese and Japanese. Approved RU/EN copy
is the factual baseline. Translate biography and general product descriptions,
not imagined achievements. Keep the profile and projects primary and support
secondary in every language.

Preserve the 2015/2018 career dates, Citeck, SPK Ocular, SPK MM Client and SPK Mail.
Use “free of charge” wording where a local word for “free” might only imply a
software license. Do not introduce possessive project descriptions, paid features,
extra contact routes, private keys, Lightning acceptance or invented payment methods.
Wallet addresses, network names and QR payloads are identical in every locale.

Translations were authored and reviewed for meaning, terminology and natural
phrasing, but have not received independent native-speaker certification.
Automated checks catch missing content, changed dates and rendering errors; they
cannot certify every stylistic choice. Known unresolved mistranslations prevent
publishing a locale. The owner explicitly prefers fewer polished languages over
poorly translated coverage. Persian is deferred until terminology and language
review are adequate, not because this work established that AI always translates
Persian poorly.

Use simplified Chinese and Japanese-appropriate punctuation; preserve recognizable
technical identifiers. Portuguese follows Brazilian usage. About uses an informal
personal tone in German/Spanish/Portuguese and a polite tone in French/Japanese.
Keep the deliberate introduction line break and equivalent meaning across locales.

`src/languages.mjs` owns names, URL mapping and browser matching. `src/content.mjs`
owns RU/EN and imports full JSON dictionaries in `src/locales/`. A new locale
requires complete copy and all three project descriptions before being advertised.
The root matches saved preference, ordered browser languages and English fallback;
explicit non-root language URLs always win. When storage is unavailable, a
manual Russian choice uses `?lang=ru` on the canonical root to override browser
detection. Other choices remove this marker while preserving unrelated parameters. Traditional Chinese is not silently
mapped to simplified Chinese. The link menu remains usable with JavaScript or
storage disabled. No translation service is contacted at runtime.

`npm test`, `npm run build`, `npm run verify`, `npm run format:check` and a preview
Lighthouse audit are the release checks. Browser verification covers all eight
languages/themes, address copying and QR decoding, language behavior, no-JavaScript
navigation, inaccessible storage and 320px layout. Inspect screenshots as well as
reading test output.

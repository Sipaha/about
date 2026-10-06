# Personal about site

Read README.md before changing the site. Keep the introduction and projects
primary, donations secondary. Do not invent biography, employment, or contact details. Public payment configuration is
src/site.json; locale copy is src/content.mjs. Do not invent wallet addresses,
Boosty profiles, balances, donor counts, or claims about payment safety.
Never request or store private keys or recovery phrases. Lightning is on hold.
Repository integration is on hold: do not edit other projects or publish funding
links without a new explicit request. Do not change another project’s funding
policy when linking to this site.

Keep the site static, accessible without JavaScript, free of tracking and external
runtime requests. Maintain RU/EN and light/dark parity. QR data and copied data
must exactly match the public configuration. New networks require address-format
validation and browser QR checks, not just a display label.

All edits stay in this Solution. Put temporary output in ../.agents/tmp/about;
set TMPDIR before launching browser tools. Never change global Git/npm settings.
Commit author and committer: Pavel Simonov <sipahabk@gmail.com>.
Run npm test, npm run build, and npm run verify before shipping; inspect screenshots.
Run Lighthouse against the preview for material page changes.

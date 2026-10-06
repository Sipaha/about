# Shared SPK software ideas

Owner decision recorded on 2026-10-06. This document records direction, not a
claim that every existing application already implements it.

## Language accessibility

Quality free software should be accessible regardless of a user's language.
Localize product websites, onboarding, everyday UI, errors and essential help;
a language selector alone does not deliver accessibility. Use native language
names, remember an explicit choice and use browser/system language as an initial
hint. Direct language URLs take precedence on websites. Keep English as a
predictable fallback and prevent missing translation keys from silently shipping.
Support writing direction, readable local scripts, keyboard access and responsive
layout. Preserve technical identifiers, commands, email and wallet addresses
exactly, with LTR isolation where the surrounding language is RTL.

Translation coverage on a website must not imply the application or linked
external documentation supports that language. Publish the actual coverage.
Translations require terminology review and maintenance when product facts change.

The current implementation request covers the personal About website and the
independent Ocular website only. Application localization and other repositories
are future work requiring their own tasks.

## Community discovery

The owner is interested in future outreach to local developer communities,
including Chinese and Iranian communities. Start from a concrete useful workflow,
a working download and localized installation guidance. Seek voluntary feedback
on real tasks. Select languages and channels based on relevant audience and the
ability to support users, not country size alone.

Promotion, contacting communities and publishing posts have not been authorized
by this decision. No analytics or product telemetry is implied. See the dated
[market analysis](markets-2026-10-06.md) for evidence and hypotheses.

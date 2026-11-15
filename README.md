# hackatoa.com

Personal website of Preston (Hackatoa) — developer, homelab engineer, and AI enthusiast.

🔗 **Live:** [hackatoa.com](https://hackatoa.com)   ·   ☕ **Support:** [Buy Me a Coffee](https://buymeacoffee.com/hackatoa)

## Overview

An interactive WebGL landing page built with Three.js: a felt-craft volcano particle scene that renders the site's sections in 3D. All content is also mirrored as real, crawlable HTML so the page stays fully indexable. Narrow-viewport and no-WebGL visitors get a lightweight `/urls/` version; search-engine and social crawlers are never redirected.

## Features

- Three.js particle/volcano scene with an accessible HTML content mirror
- 6-language localization (ES, PT-BR, FR, DE, VI, TH) with hreflang + per-locale URLs
- Lightweight `/urls/` lite version for mobile / no-WebGL
- JSON-LD structured data, Open Graph / Twitter cards, web manifest

## Tech Stack

Static HTML · Three.js · vanilla JS · Firebase Hosting

## Development

```bash
# serve the static site locally
cd public && python3 -m http.server 8080
```

### Localization

`public/index.html` is the English source; `public/<locale>/index.html` are generated. After editing the English page:

```bash
npm run i18n:build
```

Translations come from `i18n.translations.json` (committed cache). With no `GEMINI_API_KEY` the build is offline and deterministic — strings missing from the cache stay English and are listed as warnings; add them to the cache or rerun with a key to translate only the new strings. `npm test` fails if a locale page is out of sync with the English source. JS string literals that need translating go in `scriptStrings` in `i18n.config.json`.

## Deployment

Firebase Hosting. Pushes to `Main` touching `public/`, `firebase.json`, or `.firebaserc` deploy automatically via GitHub Actions (`deploy-hosting.yml`).

## Support

If this project is useful to you, consider supporting development:

☕ **[Buy Me a Coffee](https://buymeacoffee.com/hackatoa)**

---

Part of the **[Hackatoa](https://hackatoa.com)** ecosystem — self-hosted apps, browser games, and bots. · [All repositories »](https://github.com/Hackatoan)

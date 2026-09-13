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

Static HTML · Three.js · vanilla JS · nginx · Docker

## Development

```bash
# serve the static site locally
cd public && python3 -m http.server 8080
```

## Deployment

Self-hosted on the homelab Docker host behind Cloudflare → NPMplus. Pushes to `Main` build `ghcr.io/hackatoan/hackatoa-com` and auto-deploy via Watchtower.

## Support

If this project is useful to you, consider supporting development:

☕ **[Buy Me a Coffee](https://buymeacoffee.com/hackatoa)**

---

Part of the **[Hackatoa](https://hackatoa.com)** ecosystem — self-hosted apps, browser games, and bots. · [All repositories »](https://github.com/Hackatoan)

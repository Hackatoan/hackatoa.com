#!/usr/bin/env node
// Reusable auto-localizer for content-heavy static pages.
// Translates visible text nodes + SEO meta/attrs IN PLACE, protecting
// <script>/<style>/<code>/<pre> and never touching tags, ids, classes or scripts
// (except the exact JS string literals listed in cfg.scriptStrings).
// Injects hreflang + a language switcher, fixes relative asset paths for
// /<locale>/ subdirs, and writes a hreflang sitemap. Config: i18n.config.json.
//
// Translations are resolved cache-first, so rebuilds are deterministic:
//   1. i18n.translations.json (committed cache, rewritten after every run)
//   2. harvested from the checked-in public/<locale>/ page, only while that locale has
//      no cache section yet (bootstrap / migration); after that the cache is the truth
//   3. Gemini, only for strings still missing and only when GEMINI_API_KEY is set
// With no key (or --offline) missing strings stay English and are listed as gaps.
//   Usage: npm run i18n:build                      # offline, free
//          GEMINI_API_KEY=... npm run i18n:build   # also translates new strings
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(ROOT, 'i18n.config.json'), 'utf8'));
const CACHE_FILE = join(ROOT, 'i18n.translations.json');
const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
const ORIGIN = cfg.origin;
const LOCALES = cfg.locales;
const SCRIPT_STRINGS = cfg.scriptStrings || [];
const HREFLANG = { en: 'en', 'pt-br': 'pt-BR', es: 'es', fr: 'fr', de: 'de', vi: 'vi', th: 'th' };
const LANGNAME = { es: 'Spanish', 'pt-br': 'Brazilian Portuguese', fr: 'French', de: 'German', vi: 'Vietnamese', th: 'Thai' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROTECT = /<(script|style|code|pre)\b[\s\S]*?<\/\1>/gi;   // never translate these
const ATTR = /((?<![\w:-])(?:placeholder|alt|aria-label|title)=")([^"]*)(")/gi;   // not data-title / og:title
const META = /(<meta\s+(?:name="(?:description|keywords|twitter:title|twitter:description)"|property="(?:og:title|og:description)")\s+content=")([^"]*)(")/gi;
const hasLetter = (s) => /[A-Za-z]/.test(s);
const protect = (html) => { const blocks = []; const out = html.replace(PROTECT, (m) => `%%${blocks.push(m) - 1}%%`); return { out, blocks }; };
const restore = (html, blocks) => html.replace(/%%(\d+)%%/g, (m, i) => blocks[+i]);
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const jsLiteral = (s) => new RegExp(`(['"\`])${reEsc(s)}\\1`, 'g');

async function translateBatch(strings, langName, code, key) {
  if (!strings.length) return [];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const prompt = `Translate each string in this JSON array from English into ${langName} (locale "${code}").
Return ONLY a JSON array of the same length and order — exactly one translation per input string.
Rules:
- Natural, idiomatic for native speakers. This is a video-game website.
- Preserve leading/trailing whitespace of each string.
- Keep emoji, symbols (↓ ⬇ · — ✕ etc.), HTML entities (&nbsp; &amp; …) and any %%N%% tokens EXACTLY.
- Do NOT translate brand/proper names or technical tokens: ${(cfg.keepTerms || []).join(', ')}.
- If a string is only a number/symbol/token, return it unchanged.
Input:
${JSON.stringify(strings)}`;
  for (let a = 1; a <= 6; a++) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }) });
    const data = await res.json().catch(() => ({}));
    const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (txt) { try { const arr = JSON.parse(txt); if (Array.isArray(arr) && arr.length === strings.length) return arr; } catch { /* retry */ } }
    const s = data?.error?.status || res.status;
    console.warn(`    batch retry ${a} (${s})`);
    await sleep(s === 'RESOURCE_EXHAUSTED' ? 20000 : 2000 * a);
  }
  throw new Error('translateBatch failed');
}

// collect unique translatable English strings from a page, in document order
export function collect(html) {
  const { out, blocks } = protect(html);
  const set = new Set();
  out.replace(/>([^<>]+)</g, (m, t) => { if (hasLetter(t)) set.add(t); return m; });
  out.replace(META, (m, p, c) => { if (hasLetter(c)) set.add(c); return m; });
  out.replace(ATTR, (m, p, v) => { if (hasLetter(v)) set.add(v); return m; });
  for (const s of SCRIPT_STRINGS) if (blocks.some((b) => /^<script/i.test(b) && jsLiteral(s).test(b))) set.add(s);
  return [...set];
}

// apply value->translation map back to the page
export function apply(html, map) {
  const { out, blocks } = protect(html);
  const tr = (v) => (map.has(v) && map.get(v) != null ? map.get(v) : v);
  const s = out
    .replace(/>([^<>]+)</g, (m, t) => (hasLetter(t) ? `>${tr(t)}<` : m))
    .replace(META, (m, p, c, q) => `${p}${tr(c)}${q}`)
    .replace(ATTR, (m, p, v, q) => (hasLetter(v) ? `${p}${tr(v)}${q}` : m));
  const outBlocks = blocks.map((b) => (/^<script/i.test(b)
    ? SCRIPT_STRINGS.reduce((acc, str) => acc.replace(jsLiteral(str), (m, q) => q + tr(str).replaceAll('\\', '\\\\').replaceAll(q, '\\' + q) + q), b)
    : b));
  return restore(s, outBlocks);
}

// ---- harvest: recover en->locale translations from an already-built locale page ----
// Bootstrap only (a locale with no cache section yet). Pages are tokenized into tags
// and text runs; tags are compared by name + attribute NAMES (values differ: translated
// attrs, /-prefixed paths, canonical URLs), then aligned with a weighted LCS so a few
// inserted/removed English nodes don't shift the rest. Text matches score higher when
// they sit after the same tag and keep the same punctuation/digit shape, which breaks
// the ties that inserted <a>…</a> runs otherwise create.
const normTag = (t) => t.replace(ATTR, '$1$3').replace(/\b(href|src)="\/?/g, '$1="');
const shape = (t) => t.replace(/[\p{L}\p{M}][\p{L}\p{M}\s'’-]*/gu, 'x');
const tokenize = (html) => {
  const toks = [];
  let prev = '';
  for (const m of protect(html).out.matchAll(/<[^>]*>|[^<]+/g)) {
    const v = m[0];
    // text runs: B = holds a protected block, T = has words, S = symbols/whitespace only
    const key = v[0] === '<' ? 'G' + v.replace(/="[^"]*"/g, '') : /%%\d+%%/.test(v) ? 'B' : /\p{L}/u.test(v) ? 'T' : 'S' + v;
    toks.push({ v, key, prev, shape: key === 'T' ? shape(v) : '' });
    if (v[0] === '<') prev = normTag(v);
  }
  return toks;
};
const weight = (a, b) => (a.key !== 'T' ? 4 : 2 + (a.prev === b.prev) + (a.shape === b.shape));
function lcsPairs(a, b) {
  const n = a.length, m = b.length, w = m + 1;
  const dp = new Uint32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) {
      const skip = Math.max(dp[(i + 1) * w + j], dp[i * w + j + 1]);
      dp[i * w + j] = a[i].key === b[j].key ? Math.max(skip, dp[(i + 1) * w + j + 1] + weight(a[i], b[j])) : skip;
    }
  const pairs = [];
  for (let i = 0, j = 0; i < n && j < m;) {
    const here = dp[i * w + j];
    if (a[i].key === b[j].key && here === dp[(i + 1) * w + j + 1] + weight(a[i], b[j])) pairs.push([a[i++], b[j++]]);
    else if (here === dp[(i + 1) * w + j]) i++;
    else j++;
  }
  return pairs;
}
const attrsOf = (tag) => {
  const o = new Map();
  for (const m of tag.matchAll(ATTR)) o.set(m[1], m[2]);
  for (const m of tag.matchAll(META)) o.set('meta', m[2]);
  return o;
};
export function harvest(enHtml, locHtml) {
  const map = new Map(), conflicts = new Map();
  const put = (en, lo) => {
    if (!hasLetter(en)) return;
    if (!map.has(en)) map.set(en, lo);
    else if (map.get(en) !== lo) conflicts.set(en, [map.get(en), lo]);
  };
  for (const [e, l] of lcsPairs(tokenize(enHtml), tokenize(locHtml))) {
    if (e.key === 'T') put(e.v, l.v);
    else if (e.key[0] === 'G') { const la = attrsOf(l.v); for (const [k, v] of attrsOf(e.v)) if (la.has(k)) put(v, la.get(k)); }
  }
  // JS string literals: split each English <script> line around the listed literals and
  // find a locale script line made of the same fixed segments in the same order (line
  // granularity, so unrelated code edits elsewhere in the block don't defeat the match).
  const scriptLines = (h) => protect(h).blocks.filter((x) => /^<script/i.test(x)).flatMap((x) => x.split('\n'));
  const locLines = scriptLines(locHtml);
  for (const line of scriptLines(enHtml)) {
    const hits = SCRIPT_STRINGS.flatMap((s) => [...line.matchAll(jsLiteral(s))].map((m) => ({ s, at: m.index + 1, end: m.index + 1 + s.length })))
      .sort((x, y) => x.at - y.at);
    if (!hits.length) continue;
    const segs = hits.map((h, i) => line.slice(i ? hits[i - 1].end : 0, h.at)).concat(line.slice(hits.at(-1).end));
    for (const ll of locLines) {
      if (!ll.startsWith(segs[0])) continue;
      let pos = segs[0].length; const got = [];
      for (const seg of segs.slice(1)) { const i = ll.indexOf(seg, pos); if (i < 0) break; got.push(ll.slice(pos, i)); pos = i + seg.length; }
      if (got.length === hits.length && pos === ll.length) { hits.forEach((h, i) => put(h.s, got[i].replace(/\\(.)/g, '$1'))); break; }
    }
  }
  return { map, conflicts };
}

const pageUrl = (page, l) => `${ORIGIN}${l === 'en' ? '' : '/' + l}${page.urlPath}`;
const hreflangBlock = (page) => {
  const links = LOCALES.map((l) => `  <link rel="alternate" hreflang="${HREFLANG[l]}" href="${pageUrl(page, l)}" />`);
  links.push(`  <link rel="alternate" hreflang="x-default" href="${pageUrl(page, 'en')}" />`);
  return `\n  <!-- i18n:hreflang:start -->\n${links.join('\n')}\n  <!-- i18n:hreflang:end -->`;
};
// language switcher UI is disabled; the empty markers are kept so strip() stays idempotent
const switcher = () => `\n<!-- i18n:switcher:start -->\n<!-- i18n:switcher:end -->`;
export const strip = (h) => h
  .replace(/\s*<!-- i18n:hreflang:start -->[\s\S]*?<!-- i18n:hreflang:end -->/g, '')
  .replace(/\s*<!-- i18n:switcher:start -->[\s\S]*?<!-- i18n:switcher:end -->/g, '');
const inject = (html, page, cur) => html
  .replace('</head>', `${hreflangBlock(page)}\n</head>`)
  .replace(/(<body[^>]*>)/, `$1${switcher(page, cur)}`);

const tagCount = (h) => (h.match(/<[a-zA-Z!/][^>]*>/g) || []).length;
const idList = (h) => JSON.stringify([...h.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
const outPathFor = (page, loc) => (page.file === cfg.rootFile ? join(ROOT, `public/${loc}/index.html`) : join(ROOT, `public/${loc}/${page.file}`));

// build one localized page from the (stripped) English source
export function localize(src, page, loc, map) {
  let out = apply(src, map);
  out = out.replace(/<html lang="en">/i, `<html lang="${loc}">`);
  out = out.replace(/\b(href|src)="(?![a-zA-Z][a-zA-Z0-9+.-]*:|\/|#)([^"]+)"/g, (m, a, p) => `${a}="/${p}"`);
  // self-referential canonical + og:url for the localized page (both attr orders)
  const locUrl = pageUrl(page, loc);
  out = out.replace(/(<link\b[^>]*\brel="canonical"[^>]*\bhref=")[^"]*(")/i, `$1${locUrl}$2`)
           .replace(/(<link\b[^>]*\bhref=")[^"]*("[^>]*\brel="canonical")/i, `$1${locUrl}$2`)
           .replace(/(<meta\b[^>]*\bproperty="og:url"[^>]*\bcontent=")[^"]*(")/i, `$1${locUrl}$2`);
  // keep internal links in-locale (e.g. /play -> /<loc>/game.html)
  for (const [from, to] of Object.entries(cfg.internalLinks || {}))
    out = out.split(`href="${from}"`).join(`href="/${loc}${to}"`);
  return { out, drift: tagCount(out) !== tagCount(src) || idList(out) !== idList(src), html: inject(out, page, loc) };
}

async function main() {
  const KEY = process.argv.includes('--offline') ? null : process.env.GEMINI_API_KEY;
  if (!KEY) console.log('offline mode: cache + checked-in locale pages only (no API calls)');
  const cache = existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf8')) : {};
  const nextCache = {};

  const bases = {};
  for (const page of cfg.pages) bases[page.file] = strip(readFileSync(join(ROOT, 'public', page.file), 'utf8'));
  for (const page of cfg.pages) writeFileSync(join(ROOT, 'public', page.file), inject(bases[page.file], page, 'en'));
  console.log('en    -> hreflang + switcher injected into source pages');

  let drift = 0, gaps = 0;
  const changedPages = new Set();
  for (const loc of LOCALES.filter((l) => l !== 'en')) {
    const known = cache[loc] || {};
    nextCache[loc] = {};
    for (const page of cfg.pages) {
      const src = bases[page.file];
      const outPath = outPathFor(page, loc);
      const prev = existsSync(outPath) ? readFileSync(outPath, 'utf8') : null;
      const harvested = prev && !cache[loc] ? harvest(src, strip(prev)) : { map: new Map(), conflicts: new Map() };
      const uniq = collect(src);
      const map = new Map();
      const missing = [];
      for (const v of uniq) {
        if (Object.hasOwn(known, v)) map.set(v, known[v]);
        else if (harvested.map.has(v)) {
          map.set(v, harvested.map.get(v));
          if (harvested.conflicts.has(v)) console.warn(`  ⚠ ${loc}: "${v}" had inconsistent translations; using the first`);
        } else missing.push(v);
      }
      if (missing.length && KEY) {
        const tr = await translateBatch(missing, LANGNAME[loc], loc, KEY);
        missing.forEach((v, i) => map.set(v, tr[i]));
        console.log(`  ${loc}/${page.file}: translated ${missing.length} new string(s) via ${MODEL}`);
        await sleep(1200);
      } else if (missing.length) {
        gaps += missing.length;
        for (const v of missing) console.warn(`  ⚠ ${loc}/${page.file}: no translation for ${JSON.stringify(v)} (left in English)`);
      }
      for (const v of uniq) if (map.has(v)) nextCache[loc][v] = map.get(v);
      const { drift: d, html } = localize(src, page, loc, map);
      if (d) { console.warn(`  ⚠ ${loc}/${page.file}: STRUCTURE DRIFT`); drift++; }
      if (html !== prev) changedPages.add(page.urlPath);
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, html);
    }
    console.log(`${loc.padEnd(5)} -> ${cfg.pages.length} page(s)`);
  }
  writeFileSync(CACHE_FILE, JSON.stringify(nextCache, null, 2) + '\n');

  // lastmod only moves when a page's localized output actually changed, so a no-op
  // rebuild leaves sitemap.xml byte-identical.
  const sitemapPath = join(ROOT, 'public/sitemap.xml');
  const oldMod = new Map();
  if (existsSync(sitemapPath))
    for (const m of readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) oldMod.set(m[1], m[2]);
  const today = new Date().toISOString().slice(0, 10);
  const lastmod = (loc, changed) => (!changed && oldMod.get(loc)) || today;
  const urls = cfg.pages.flatMap((page) => LOCALES.map((l) => {
    const alts = LOCALES.map((x) => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[x]}" href="${pageUrl(page, x)}"/>`).join('\n')
      + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(page, 'en')}"/>`;
    return `  <url>\n    <loc>${pageUrl(page, l)}</loc>\n    <lastmod>${lastmod(pageUrl(page, l), changedPages.has(page.urlPath))}</lastmod>\n${alts}\n  </url>`;
  })).join('\n');
  // Non-localized, indexable standalone pages (resume, songs, urls, etc.).
  const extraUrls = (cfg.extraUrls || [])
    .map((p) => `  <url>\n    <loc>${ORIGIN}${p}</loc>\n    <lastmod>${lastmod(ORIGIN + p, false)}</lastmod>\n  </url>`)
    .join('\n');
  const allUrls = extraUrls ? `${urls}\n${extraUrls}` : urls;
  writeFileSync(sitemapPath, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${allUrls}\n</urlset>\n`);
  console.log(`sitemap -> public/sitemap.xml`);
  console.log(drift ? `${drift} page(s) drifted — inspect!` : 'No structure drift.');
  if (gaps) console.warn(`${gaps} untranslated string(s) — rerun with GEMINI_API_KEY or add them to i18n.translations.json`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();

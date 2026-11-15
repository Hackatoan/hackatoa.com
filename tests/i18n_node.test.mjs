import { test, describe } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collect, apply, harvest, localize, strip } from '../scripts/i18n-auto.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(ROOT, 'i18n.config.json'), 'utf8'));
const cache = JSON.parse(readFileSync(join(ROOT, 'i18n.translations.json'), 'utf8'));

describe('i18n-auto', () => {
  test('translates title attributes but not data-title / og:title', () => {
    const html = '<a title="Browse all songs" data-title="Keep me">x</a><meta property="og:title" content="Site">';
    assert.deepStrictEqual(collect(html), ['x', 'Site', 'Browse all songs']);
    const out = apply(html, new Map([['Browse all songs', 'Ver todas'], ['Keep me', 'NO']]));
    assert.match(out, /title="Ver todas"/);
    assert.match(out, /data-title="Keep me"/);
  });

  test('harvest survives an English node inserted next to similar nodes', () => {
    const en = '<p><a href="/c">Cookies</a> · <a href="#" data-x>Cookie settings</a> · Last updated <time>Aug</time></p>';
    const es = '<p><a href="/c">Cookies</a> · Última actualización <time>Ago</time></p>';
    const { map } = harvest(en, es);
    assert.strictEqual(map.get(' · Last updated '), ' · Última actualización ');
    assert.strictEqual(map.get('Cookies'), 'Cookies');
    assert.ok(!map.has('Cookie settings'));
  });

  test('harvests and applies configured JS string literals, escaping quotes', () => {
    const [s] = cfg.scriptStrings;
    const en = `<script>\nfoo();\nb.setAttribute('aria-label','${s}');\n</script>`;
    const loc = `<script>\nbar();\nb.setAttribute('aria-label','L\\'x');\n</script>`;
    assert.strictEqual(harvest(en, loc).map.get(s), "L'x");
    assert.match(apply(en, new Map([[s, "L'x"]])), /'L\\'x'/);
  });

  test('checked-in locale pages match an offline rebuild from the English source + cache', () => {
    for (const page of cfg.pages) {
      const src = strip(readFileSync(join(ROOT, 'public', page.file), 'utf8'));
      for (const loc of cfg.locales.filter((l) => l !== 'en')) {
        const file = page.file === cfg.rootFile ? `public/${loc}/index.html` : `public/${loc}/${page.file}`;
        const { html } = localize(src, page, loc, new Map(Object.entries(cache[loc])));
        assert.ok(html === readFileSync(join(ROOT, file), 'utf8'), `${file} is stale — run npm run i18n:build`);
      }
    }
  });
});

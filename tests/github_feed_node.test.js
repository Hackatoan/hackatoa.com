const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');

// Mock browser environment
const appJsPath = path.resolve(__dirname, '../public/app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

function createMockEnv() {
  const dom = {
    elements: {},
    getElementById(id) {
      if (!this.elements[id]) {
        this.elements[id] = {
            textContent: '',
            style: {},
            appendChild: () => {},
            innerHTML: '',
            querySelectorAll: () => []
        };
      }
      return this.elements[id];
    },
    querySelector(selector) {
       if (!this.elements[selector]) {
           this.elements[selector] = {
               innerHTML: '',
               children: [],
               appendChild(child) {
                   if (child && child.nodeType === 11) {
                       this.children.push(...child.children);
                       child.children = [];
                   } else {
                       this.children.push(child);
                   }
               },
               classList: { add: () => {}, remove: () => {} },
               addEventListener: () => {},
               querySelectorAll: () => [],
               style: {},
               clientWidth: 1024
           };
       }
       return this.elements[selector];
    },
    querySelectorAll(selector) {
        return [];
    },
    addEventListener: () => {},
    body: {
        classList: {
            toggle: () => {},
            remove: () => {}
        }
    },
    createDocumentFragment() {
        return {
            nodeType: 11,
            children: [],
            appendChild(child) {
                this.children.push(child);
            }
        };
    },
    createElement(tag) {
        return {
            tagName: tag,
            className: '',
            textContent: '',
            href: '',
            target: '',
            rel: '',
            children: [],
            appendChild(child) {
                if (child.nodeType === 11) {
                    this.children.push(...child.children);
                    child.children = [];
                } else {
                    this.children.push(child);
                }
            },
            style: {},
            classList: { add: () => {} }
        };
    }
  };

  const win = {
    addEventListener: () => {},
    setInterval: () => {},
    scrollTo: () => {},
    location: { hash: '' },
    innerWidth: 1024,
    BLOG_ENTRIES: [],
    MUSHROOMS_DATA: [],
    YT: {
        Player: function() {
            return {
                setVolume: () => {},
                setShuffle: () => {},
            };
        },
        PlayerState: { PLAYING: 1, PAUSED: 2 }
    }
  };

  const context = {
    document: dom,
    window: win,
    console: {
      log: () => {},
      error: () => {},
      warn: () => {}
    },
    fetch: null,
    Intl: Intl,
    Date: Date,
    Error: Error,
    URL: URL,
    setTimeout: setTimeout,
    YT: win.YT,
    localStorage: {
        store: {},
        getItem(key) { return this.store[key] || null; },
        setItem(key, value) { this.store[key] = value.toString(); },
        clear() { this.store = {}; }
    },
    navigator: {
        userAgent: 'node'
    },
    Math: Math,
    Audio: class { constructor() { this.src = ""; this.volume = 1; this.paused = true; } play() { return Promise.resolve(); } pause() {} addEventListener() {} },
    Array: Array,
    Object: Object,
    JSON: JSON,
    parseInt: parseInt
  };

  vm.createContext(context);
  vm.runInContext(appJsContent, context);
  return context;
}

describe('initGitHubFeed', () => {
  test('should fallback to hardcoded data on fetch error when cache is empty', async () => {
    const context = createMockEnv();

    // Clear localStorage
    context.localStorage.clear();

    // Mock fetch to throw error
    context.fetch = async () => {
        throw new Error('Network error');
    };

    // Call initGitHubFeed
    context.initGitHubFeed();

    // Wait for microtasks (promises) to settle
    await new Promise(resolve => setTimeout(resolve, 0));

    // Get the container
    const container = context.document.querySelector('.github-pinner');

    // Verify that the fallback item is created
    assert.strictEqual(container.children.length, 1);
    const eventItem = container.children[0];
    assert.strictEqual(eventItem.className, 'gh-event');

    const header = eventItem.children[0];
    assert.strictEqual(header.className, 'gh-header');

    const repoLink = header.children[1];
    assert.strictEqual(repoLink.textContent, 'Hackatoan/hackatoa.com');
    assert.strictEqual(repoLink.href, 'https://github.com/Hackatoan/hackatoa.com');

    const commitDiv = eventItem.children[1];
    assert.strictEqual(commitDiv.className, 'gh-commit');
    assert.strictEqual(commitDiv.textContent, 'Update security configurations and CMS data');
  });

  test('should handle localStorage.getItem error and fetch fresh data', async () => {
    const context = createMockEnv();

    // Mock localStorage.getItem to throw
    context.localStorage.getItem = () => {
        throw new Error('Access denied');
    };

    let fetchCalled = false;
    context.fetch = async () => {
        fetchCalled = true;
        return {
            ok: true,
            json: async () => []
        };
    };

    context.initGitHubFeed();

    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(fetchCalled, true);
    const container = context.document.querySelector('.github-pinner');
    // Should render "No recent activity found." because json returned []
    assert.strictEqual(container.children.length, 1);
    assert.strictEqual(container.children[0].className, 'gh-placeholder');
  });

  test('should handle JSON.parse error of cached data and fetch fresh data', async () => {
    const context = createMockEnv();

    // Set invalid JSON in localStorage
    context.localStorage.store['github-events-cache'] = 'invalid-json';

    let fetchCalled = false;
    context.fetch = async () => {
        fetchCalled = true;
        return {
            ok: true,
            json: async () => []
        };
    };

    context.initGitHubFeed();

    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(fetchCalled, true);
    const container = context.document.querySelector('.github-pinner');
    assert.strictEqual(container.children.length, 1);
    assert.strictEqual(container.children[0].className, 'gh-placeholder');
  });

  test('should handle localStorage.setItem error and still render fetched data', async () => {
    const context = createMockEnv();

    // Mock localStorage.setItem to throw
    context.localStorage.setItem = () => {
        throw new Error('Quota exceeded');
    };

    context.fetch = async () => {
        return {
            ok: true,
            json: async () => [
                {
                    type: 'PushEvent',
                    repo: { name: 'test/repo' },
                    created_at: new Date().toISOString(),
                    payload: { commits: [{ message: 'test commit' }] }
                }
            ]
        };
    };

    context.initGitHubFeed();

    await new Promise(resolve => setTimeout(resolve, 0));

    const container = context.document.querySelector('.github-pinner');
    assert.strictEqual(container.children.length, 1);
    const eventItem = container.children[0];
    assert.strictEqual(eventItem.className, 'gh-event');
    const header = eventItem.children[0];
    const repoLink = header.children[1];
    assert.strictEqual(repoLink.textContent, 'test/repo');
  });
});

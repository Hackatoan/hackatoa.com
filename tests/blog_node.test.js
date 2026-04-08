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
            children: [],
            appendChild(child) {
              this.children.push(child);
            },
            innerHTML: '',
            querySelectorAll: () => []
        };
      }
      return this.elements[id];
    },
    querySelector(selector) {
       return {
           addEventListener: () => {},
           querySelectorAll: () => [],
           style: {},
           clientWidth: 1024
       };
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
    createElement(tag) {
      return {
        style: {},
        appendChild: () => {},
        classList: { add: () => {} },
        className: '',
        textContent: '',
        tagName: tag.toUpperCase()
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
        PlayerState: {
            PLAYING: 1,
            PAUSED: 2
        }
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
        getItem: () => null,
        setItem: () => {}
    },
    navigator: {
        userAgent: 'node'
    },
    Math: Math,
    Array: Array,
    Object: Object,
    JSON: JSON
  };

  vm.createContext(context);
  vm.runInContext(appJsContent, context);
  return context;
}

describe('renderBlogFromData', () => {
  test('should display placeholder when BLOG_ENTRIES is empty', async () => {
    const context = createMockEnv();
    context.window.BLOG_ENTRIES = [];

    context.renderBlogFromData();

    const container = context.document.getElementById('blog-list');

    // Test container has 1 child
    assert.strictEqual(container.children.length, 1);

    const placeholder = container.children[0];

    // Check if placeholder properties match the expected values
    assert.strictEqual(placeholder.className, 'blog-placeholder');
    assert.strictEqual(placeholder.textContent, 'No entries found');
  });
});

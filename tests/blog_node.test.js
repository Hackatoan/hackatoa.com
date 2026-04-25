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
            appendChild: function(child) {
              if (child && child.nodeType === 11) {
                  this.children.push(...child.children);
                  child.children = [];
              } else {
                  this.children.push(child);
              }
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
    createElement: (tag) => ({
        tagName: tag,
        style: {},
        children: [],
        appendChild: function(child) {
              if (child && child.nodeType === 11) {
                  this.children.push(...child.children);
                  child.children = [];
              } else {
                  this.children.push(child);
              }
        },
        classList: { add: () => {} }
    }),
    createDocumentFragment: () => ({
        nodeType: 11,
        children: [],
        appendChild: function(child) {
            this.children.push(child);
        }
    })
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
  test('should append placeholder when BLOG_ENTRIES is empty', () => {
    const context = createMockEnv();
    const container = context.document.getElementById('blog-list');

    context.window.BLOG_ENTRIES = [];

    // Call the function
    context.renderBlogFromData();

    // Assert placeholder is appended
    assert.strictEqual(container.children.length, 1);
    const placeholder = container.children[0];
    assert.strictEqual(placeholder.tagName, 'div');
    assert.strictEqual(placeholder.className, 'blog-placeholder');
    assert.strictEqual(placeholder.textContent, 'No entries found');
  });

  test('should append placeholder when BLOG_ENTRIES is not an array', () => {
    const context = createMockEnv();
    const container = context.document.getElementById('blog-list');

    context.window.BLOG_ENTRIES = null;

    // Call the function
    context.renderBlogFromData();

    // Assert placeholder is appended
    assert.strictEqual(container.children.length, 1);
    const placeholder = container.children[0];
    assert.strictEqual(placeholder.tagName, 'div');
    assert.strictEqual(placeholder.className, 'blog-placeholder');
    assert.strictEqual(placeholder.textContent, 'No entries found');
  });
});

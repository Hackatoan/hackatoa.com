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
    createDocumentFragment: () => ({ nodeType: 11, children: [], appendChild: function(child) { this.children.push(child); } }),
    elements: {},
    getElementById(id) {
      if (!this.elements[id]) {
        this.elements[id] = {
            textContent: '',
            style: {},
            appendChild: function(child) { if (child && child.nodeType === 11) { if(this.children) { this.children.push(...child.children); } child.children = []; } else { if(this.children) { this.children.push(child); } } },
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
    createElement: () => ({
        style: {},
        appendChild: function(child) { if (child && child.nodeType === 11) { if(this.children) { this.children.push(...child.children); } child.children = []; } else { if(this.children) { this.children.push(child); } } },
        classList: { add: () => {} }
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

describe('initMOTD', () => {
  test('should update motdBody with message on success', async () => {
    const context = createMockEnv();
    const motdBody = context.document.getElementById('motd-body');

    context.fetch = async (url) => {
      if (url === '/motd.json') {
        return {
          ok: true,
          json: async () => ({ message: 'Success message' })
        };
      }
    };

    await context.initMOTD();
    assert.strictEqual(motdBody.textContent, 'Success message');
  });

  test('should update motdBody with fallback on 404', async () => {
    const context = createMockEnv();
    const motdBody = context.document.getElementById('motd-body');

    context.fetch = async (url) => {
      if (url === '/motd.json') {
        return {
          ok: false,
          status: 404
        };
      }
    };

    await context.initMOTD();
    assert.strictEqual(motdBody.textContent, 'Stay curious. Keep building.');
  });

  test('should update motdBody with fallback on network error', async () => {
    const context = createMockEnv();
    const motdBody = context.document.getElementById('motd-body');

    context.fetch = async (url) => {
      throw new Error('Network failure');
    };

    await context.initMOTD();
    assert.strictEqual(motdBody.textContent, 'Stay curious. Keep building.');
  });

  test('should update motdBody with fallback if message is missing', async () => {
    const context = createMockEnv();
    const motdBody = context.document.getElementById('motd-body');

    context.fetch = async (url) => {
      return {
        ok: true,
        json: async () => ({ unexpected: 'no message' })
      };
    };

    await context.initMOTD();
    assert.strictEqual(motdBody.textContent, 'Stay curious. Keep building.');
  });
});

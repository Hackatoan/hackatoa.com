const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');

// Mock browser environment
const appJsPath = path.resolve(__dirname, '../public/app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

function createMockEnv(slidesCount = 3) {
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
       if (selector === '.slides-track') {
         return {
           querySelectorAll: () => Array(slidesCount).fill({ id: 'slide' }),
           style: {}
         }
       }
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
    setTimeout: (cb) => { cb(); },
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
    setTimeout: win.setTimeout,
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
  const script = appJsContent + `\n
    window.getCurrentSlideIndex = () => currentSlideIndex;
    window.getIsSliding = () => isSliding;
    window.setCurrentSlideIndex = (idx) => { currentSlideIndex = idx; };
    window.setIsSliding = (val) => { isSliding = val; };
  `;
  vm.runInContext(script, context);
  return context;
}

describe('goToSlide', () => {
  test('should clamp to 0 when index is negative', () => {
    const context = createMockEnv(3);

    // Set up initial state
    context.window.setCurrentSlideIndex(2); // start somewhere else
    context.window.setIsSliding(false);

    context.goToSlide(-5);

    assert.strictEqual(context.window.getCurrentSlideIndex(), 0);
    // isSliding gets set to false by our mocked setTimeout synchronously
    assert.strictEqual(context.window.getIsSliding(), false);
  });

  test('should clamp to slides.length - 1 when index is too large', () => {
    const context = createMockEnv(3);

    // Set up initial state
    context.window.setCurrentSlideIndex(0); // start somewhere else
    context.window.setIsSliding(false);

    context.goToSlide(10);

    assert.strictEqual(context.window.getCurrentSlideIndex(), 2); // slides.length is 3, max index is 2
    assert.strictEqual(context.window.getIsSliding(), false);
  });

  test('should not change index if already at the clamped index', () => {
    const context = createMockEnv(3);

    // Set up initial state
    context.window.setCurrentSlideIndex(0); // already at 0
    context.window.setIsSliding(false);

    context.goToSlide(-5); // clamped to 0

    assert.strictEqual(context.window.getCurrentSlideIndex(), 0);
    assert.strictEqual(context.window.getIsSliding(), false);
  });
});

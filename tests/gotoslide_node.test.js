const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');

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
       if (selector === '.slides-track') {
         return {
           style: {},
           querySelectorAll: () => [
             { classList: { add: () => {} } },
             { classList: { add: () => {} } },
             { classList: { add: () => {} } }
           ]
         };
       }
       if (selector === '.slides-viewport') {
         return { clientWidth: 1024 };
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
        appendChild: () => {},
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
    setTimeout: (cb) => cb(),
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
    Audio: class { play() { return Promise.resolve(); } pause() {} },
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
    Audio: class { constructor() { this.src = ""; this.volume = 1; this.paused = true; } play() { return Promise.resolve(); } pause() {} addEventListener() {} },
    Array: Array,
    Object: Object,
    JSON: JSON
  };

  vm.createContext(context);
  vm.runInContext(appJsContent, context);
  return context;
}

describe('goToSlide boundary testing', () => {
  test('should clamp negative index to 0', () => {
    const context = createMockEnv();

    // Test negative boundary
    vm.runInContext('currentSlideIndex = 2;', context);
    vm.runInContext('goToSlide(-5);', context);

    // Assert currentSlideIndex has been clamped to 0
    const currentSlideIndex = vm.runInContext('currentSlideIndex', context);
    assert.strictEqual(currentSlideIndex, 0);
  });

  test('should clamp large index to max slides index', () => {
    const context = createMockEnv();

    // Test large positive boundary
    vm.runInContext('currentSlideIndex = 0;', context);
    vm.runInContext('goToSlide(100);', context);

    // Assert currentSlideIndex has been clamped to slides.length - 1 (which is 2 in our mock)
    const currentSlideIndex = vm.runInContext('currentSlideIndex', context);
    const slidesLength = vm.runInContext('slides.length', context);
    assert.strictEqual(currentSlideIndex, slidesLength - 1);
  });
});

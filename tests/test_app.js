const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');

const appJsPath = path.resolve(__dirname, '../public/app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

function createMockEnv(overrides = {}) {
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
            querySelectorAll: () => [],
            addEventListener: () => {},
            click: () => {}
        };
      }
      return this.elements[id];
    },
    querySelector(selector) {
       if (selector === '.slides-track') {
         if (!this.elements['.slides-track']) {
           this.elements['.slides-track'] = {
             style: {},
             querySelectorAll: () => [
               { classList: { add: () => {} } },
               { classList: { add: () => {} } },
               { classList: { add: () => {} } }
             ]
           };
         }
         return this.elements['.slides-track'];
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
    },
    ...overrides
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
  vm.runInContext(appJsContent, context);
  return context;
}

describe('app.js tests', () => {

  describe('sanitizeUrl', () => {
    test('should allow safe URLs', () => {
      const context = createMockEnv();
      assert.strictEqual(vm.runInContext('sanitizeUrl("https://example.com")', context), 'https://example.com');
      assert.strictEqual(vm.runInContext('sanitizeUrl("http://example.com")', context), 'http://example.com');
      assert.strictEqual(vm.runInContext('sanitizeUrl("/relative/path")', context), '/relative/path');
      assert.strictEqual(vm.runInContext('sanitizeUrl("./relative/path")', context), './relative/path');
      assert.strictEqual(vm.runInContext('sanitizeUrl("../relative/path")', context), '../relative/path');
    });

    test('should reject unsafe URLs', () => {
      const context = createMockEnv();
      assert.strictEqual(vm.runInContext('sanitizeUrl("javascript:alert(1)")', context), '#');
      assert.strictEqual(vm.runInContext('sanitizeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")', context), '#');
      assert.strictEqual(vm.runInContext('sanitizeUrl("vbscript:msgbox(1)")', context), '#');
      // Test fallback overriding
      assert.strictEqual(vm.runInContext('sanitizeUrl("javascript:alert(1)", "fallback")', context), 'fallback');
    });

    test('should handle edge cases', () => {
      const context = createMockEnv();
      assert.strictEqual(vm.runInContext('sanitizeUrl("")', context), '#');
      assert.strictEqual(vm.runInContext('sanitizeUrl(null)', context), '#');
      assert.strictEqual(vm.runInContext('sanitizeUrl(undefined)', context), '#');
      assert.strictEqual(vm.runInContext('sanitizeUrl("   https://example.com   ")', context), 'https://example.com');
    });
  });

  describe('addKeyboardClickSupport', () => {
    test('should trigger click on Enter', () => {
      const context = createMockEnv();
      vm.runInContext(`
        let clicked = false;
        const mockEl = {
          addEventListener(event, handler) {
            if (event === "keydown") this.handler = handler;
          },
          click() { clicked = true; }
        };
        addKeyboardClickSupport(mockEl);

        // Simulate event
        const preventDefault = () => {};
        mockEl.handler({ key: "Enter", preventDefault });

        globalThis.result = clicked;
      `, context);

      assert.strictEqual(vm.runInContext('globalThis.result', context), true);
    });

    test('should trigger click on Space', () => {
      const context = createMockEnv();
      vm.runInContext(`
        let clicked = false;
        const mockEl = {
          addEventListener(event, handler) {
            if (event === "keydown") this.handler = handler;
          },
          click() { clicked = true; }
        };
        addKeyboardClickSupport(mockEl);

        // Simulate event
        const preventDefault = () => {};
        mockEl.handler({ key: " ", preventDefault });

        globalThis.result = clicked;
      `, context);

      assert.strictEqual(vm.runInContext('globalThis.result', context), true);
    });

    test('should not trigger click on other keys', () => {
      const context = createMockEnv();
      vm.runInContext(`
        let clicked = false;
        const mockEl = {
          addEventListener(event, handler) {
            if (event === "keydown") this.handler = handler;
          },
          click() { clicked = true; }
        };
        addKeyboardClickSupport(mockEl);

        // Simulate event
        const preventDefault = () => {};
        mockEl.handler({ key: "a", preventDefault });

        globalThis.result = clicked;
      `, context);

      assert.strictEqual(vm.runInContext('globalThis.result', context), false);
    });

    test('should handle null/undefined elements gracefully', () => {
        const context = createMockEnv();
        assert.doesNotThrow(() => {
             vm.runInContext('addKeyboardClickSupport(null)', context);
             vm.runInContext('addKeyboardClickSupport(undefined)', context);
        });
    });
  });

  describe('goToSlide', () => {
    test('should clamp negative index to 0', () => {
      const context = createMockEnv();

      vm.runInContext('currentSlideIndex = 2;', context);
      vm.runInContext('goToSlide(-5);', context);

      assert.strictEqual(vm.runInContext('currentSlideIndex', context), 0);
    });

    test('should clamp large index to max slides index', () => {
      const context = createMockEnv();

      vm.runInContext('currentSlideIndex = 0;', context);
      vm.runInContext('goToSlide(100);', context);

      const slidesLength = vm.runInContext('slides.length', context);
      assert.strictEqual(vm.runInContext('currentSlideIndex', context), slidesLength - 1);
    });

    test('should skip on mobile devices', () => {
        const context = createMockEnv({ innerWidth: 500 });
        vm.runInContext('currentSlideIndex = 0;', context);
        vm.runInContext('goToSlide(2);', context);

        assert.strictEqual(vm.runInContext('currentSlideIndex', context), 0); // Should remain 0
    });

    test('should skip if index is already the current slide', () => {
        const context = createMockEnv();
        vm.runInContext('currentSlideIndex = 1;', context);
        vm.runInContext('isSliding = false;', context);
        vm.runInContext('goToSlide(1);', context);

        // isSliding should remain false if the function returned early
        assert.strictEqual(vm.runInContext('isSliding', context), false);
    });

    test('should set isSliding and update transform', () => {
        const context = createMockEnv();
        vm.runInContext('currentSlideIndex = 0;', context);
        vm.runInContext('goToSlide(1);', context);

        // isSliding is false by default because setTimout executes synchronously in our mock
        // We'll check the transform style instead.
        const transform = vm.runInContext('document.querySelector(".slides-track").style.transform', context);
        const width = vm.runInContext('document.querySelector(".slides-viewport").clientWidth', context);
        const expectedOffset = -1 * width; // -1 * 1024

        assert.strictEqual(transform, `translateX(${expectedOffset}px)`);
    });
  });
});

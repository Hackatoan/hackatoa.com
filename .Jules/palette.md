## 2024-05-18 - Missing Modal & Custom Keyboard Navigation Bug
**Learning:** Found an accessibility issue where dynamic `img` and `span` tags are used as buttons without `role="button"`, `tabIndex="0"`, or keyboard event listeners for `Enter` or `Space`, making them inaccessible to keyboard users and screen readers. Additionally, found a JavaScript implementation for a Mycology image modal where the corresponding `<div id="myco-modal">` structure was missing from `index.html`.
**Action:** When making custom components interactive (like an image that opens a modal or dots in a carousel), always include `tabIndex=0` to make them focusable, set `role="button"`, and implement `keydown` listeners for standard activation keys (`Enter`, `Space`). Always verify HTML templates include necessary elements that JavaScript assumes are present.

## 2024-05-18 - Missing Keyboard Focus on Custom Elements
**Learning:** Custom interactive elements often miss native browser focus outlines, and disabled buttons lose context for screen readers when they simply fade out.
**Action:** Always provide explicit `:focus-visible` styling (using existing design system tokens like `var(--accent)`) and add explanatory `title` attributes when toggling `disabled` states to improve keyboard and screen reader accessibility.

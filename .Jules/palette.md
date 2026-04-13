## 2024-05-18 - Missing Modal & Custom Keyboard Navigation Bug
**Learning:** Found an accessibility issue where dynamic `img` and `span` tags are used as buttons without `role="button"`, `tabIndex="0"`, or keyboard event listeners for `Enter` or `Space`, making them inaccessible to keyboard users and screen readers. Additionally, found a JavaScript implementation for a Mycology image modal where the corresponding `<div id="myco-modal">` structure was missing from `index.html`.
**Action:** When making custom components interactive (like an image that opens a modal or dots in a carousel), always include `tabIndex=0` to make them focusable, set `role="button"`, and implement `keydown` listeners for standard activation keys (`Enter`, `Space`). Always verify HTML templates include necessary elements that JavaScript assumes are present.
## 2024-05-18 - Add outline focus to interactive elements
**Learning:** Found multiple focusable elements missing visual focus indicators when navigating by keyboard, including custom arrows, dots, and buttons.
**Action:** Always add proper `:focus-visible` states to any custom interactive component to ensure robust keyboard accessibility.

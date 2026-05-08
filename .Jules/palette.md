## 2024-05-18 - Missing Modal & Custom Keyboard Navigation Bug
**Learning:** Found an accessibility issue where dynamic `img` and `span` tags are used as buttons without `role="button"`, `tabIndex="0"`, or keyboard event listeners for `Enter` or `Space`, making them inaccessible to keyboard users and screen readers. Additionally, found a JavaScript implementation for a Mycology image modal where the corresponding `<div id="myco-modal">` structure was missing from `index.html`.
**Action:** When making custom components interactive (like an image that opens a modal or dots in a carousel), always include `tabIndex=0` to make them focusable, set `role="button"`, and implement `keydown` listeners for standard activation keys (`Enter`, `Space`). Always verify HTML templates include necessary elements that JavaScript assumes are present.

## 2024-10-24 - Custom Interactive Elements Focus & Disabled States
**Learning:** Custom UI elements (like `.myco-dot`, `.music-skip`) drop standard browser focus rings and lack disabled context by default, creating silent failures for keyboard and screen reader users.
**Action:** Always explicitly define `:focus-visible` states in CSS and dynamically assign `title` attributes for disabled custom interactive components.

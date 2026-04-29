## 2026-04-29 - display: none on aria-labelled elements
**Learning:** Adding `style="display:none"` directly removes an element from the accessibility tree, which breaks screen reader support when referenced via `aria-labelledby` or `aria-describedby` (such as in modals).
**Action:** Rely solely on the `.sr-only` class to visually hide text while ensuring it remains available in the accessibility tree.

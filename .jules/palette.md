## 2024-05-12 - Ensure .sr-only class is defined
**Learning:** The `.sr-only` class is heavily used in the project's HTML (especially for modal accessibility) but is not actually defined in `public/styles.css`. This completely breaks accessibility for those elements and renders screen reader text visually instead of hiding it while remaining accessible.
**Action:** When working on a new project, verify that foundational accessibility utility classes actually exist in the CSS before using them.

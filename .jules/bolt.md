## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2024-05-24 - DocumentFragment in node:vm Mock Environments
**Learning:** When using `DocumentFragment` to batch DOM operations in `public/app.js` to minimize reflows, the Node.js `node:vm` test environments must specifically mock `document.createDocumentFragment()` to return an object with `nodeType: 11`, and all mocked `appendChild` methods must be updated to spread the fragment's children rather than appending the fragment object itself.
**Action:** Always update the DOM mock's `appendChild` to check for `nodeType === 11` when introducing `DocumentFragment` optimizations to ensure unit tests accurately reflect the fragment's child-spreading behavior.

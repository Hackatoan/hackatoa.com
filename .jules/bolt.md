## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.

## 2026-05-10 - DocumentFragment nodeType
**Learning:** Mock implementations of `appendChild` in `node:vm` tests fail if they don't explicitly handle `DocumentFragment` objects (which have `nodeType === 11`), as appending a fragment should merge its children, not nest the fragment itself.
**Action:** Always ensure test mocks that provide `appendChild` support flattening `DocumentFragment` instances by checking `child.nodeType === 11`.

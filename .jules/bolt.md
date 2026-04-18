## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2026-04-07 - handleWheel layout thrashing

**Learning:** During scroll events (), reading layout properties like `scrollTop` and `clientHeight` alongside active CSS transitions forces the browser to recalculate the layout synchronously, causing layout thrashing and animation jank.

**Action:** Place early exit checks based on internal application state (e.g., `isSliding`) before any DOM traversals or layout property queries within high-frequency event listeners.
## 2026-04-07 - handleWheel layout thrashing
**Learning:** During scroll events (handleWheel), reading layout properties like scrollTop and clientHeight alongside active CSS transitions forces the browser to recalculate the layout synchronously, causing layout thrashing and animation jank.
**Action:** Place early exit checks based on internal application state (e.g., isSliding) before any DOM traversals or layout property queries within high-frequency event listeners.

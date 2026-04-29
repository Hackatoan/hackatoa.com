## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.

## 2026-04-29 - Layout Thrashing in High-Frequency Events
**Learning:** Reading layout properties (like `scrollTop`, `clientHeight`, or `scrollHeight`) before state-based early exits in high-frequency event listeners (like `wheel`) can cause severe layout thrashing and animation jank. The browser is forced to synchronously calculate layout on every event fire, even if the result is immediately discarded by a state check.
**Action:** Always place simple state-based early-exits (like `isSliding`) before any DOM traversals (`closest`) or layout reads in scroll or animation loops.

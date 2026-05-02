## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.

## 2026-05-02 - Prevent layout thrashing in wheel event listener
**Learning:** High-frequency event listeners (like wheel) that perform DOM traversals (e.g., `e.target.closest`) and read layout properties (`scrollTop`, `clientHeight`) during ongoing CSS transitions can cause severe layout thrashing and animation jank in this architecture.
**Action:** Always place early-exit state checks (e.g., `isSliding`) before any DOM traversals or layout property reads in high-frequency event handlers.

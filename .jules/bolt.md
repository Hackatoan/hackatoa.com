## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.

## 2026-04-15 - Early Exit in High-Frequency Event Listeners
**Learning:** High-frequency events like `wheel` can cause severe layout thrashing and animation jank if DOM traversals (e.g., `closest`) or layout reads (e.g., `scrollTop`, `clientHeight`) happen before early-exit state checks.
**Action:** Always place simple boolean state checks (like `isSliding`) at the absolute beginning of high-frequency event handlers, before any DOM-dependent logic.

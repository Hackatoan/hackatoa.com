## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.

## 2026-04-21 - Prevent layout thrashing in high-frequency events
**Learning:** High-frequency event listeners like `wheel` can cause layout thrashing and animation jank if DOM traversals (e.g. `closest`) or layout reads (`scrollTop`) occur before simple early-exit state checks.
**Action:** Always place early-exit boolean state checks before any DOM operations in high-frequency event handlers.

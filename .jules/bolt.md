## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2026-04-07 - Prevent Layout Thrashing in High-Frequency Scroll Listeners
**Learning:** Performing state checks *after* layout property reads (`scrollTop`, `clientHeight`) in high-frequency event listeners like `wheel` causes layout thrashing and animation jank, especially while a CSS transition is active.
**Action:** Always place early-exit state checks (like `isSliding`) *before* any DOM traversals or layout reads in high-frequency event listeners.

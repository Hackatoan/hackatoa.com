## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2026-04-07 - Layout Thrashing in High-Frequency Listeners
**Learning:** Checking DOM state (like `scrollTop` or `clientHeight`) in high-frequency event listeners like `wheel` before state-based early exits (`isSliding`) causes layout thrashing and drops frames during the 550ms transition.
**Action:** Always place JS state early returns *before* any DOM traversal or geometry calculations in event listeners.

## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.

## 2026-04-16 - Layout Thrashing in High-Frequency Listeners
**Learning:** Checking layout properties (like `scrollTop` and `clientHeight`) or traversing the DOM (`closest`) in high-frequency event listeners like `wheel` before checking early-exit state flags (like `isSliding`) causes layout thrashing and animation jank during active transitions.
**Action:** Always place early-exit boolean state checks before any DOM reads or traversals in performance-critical event loops to skip unnecessary computation during active animations.

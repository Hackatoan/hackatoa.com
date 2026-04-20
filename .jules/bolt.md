## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2026-04-07 - Layout Thrashing in Animation Loops
**Learning:** Checking layout properties (like `scrollTop` and `clientHeight`) or running heavy DOM traversals (`closest`) during a rapid-fire event listener (like `wheel`) while a CSS transition is active forces synchronous layout recalculations, causing animation jank.
**Action:** Always place simple boolean state locks (like `isSliding`) at the very top of high-frequency event handlers, before any DOM reads or traversals.

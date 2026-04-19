## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.

## 2026-04-19 - Prevent layout thrashing on wheel events
**Learning:** In high-frequency events like `wheel`, executing DOM reads (like `scrollTop` or `clientHeight`) before a state check can force unnecessary synchronous layout calculations even when the event would otherwise be ignored (e.g. during a slide animation).
**Action:** Move early-exit state checks (like `isSliding`) to the very top of the event listener, before any DOM traversal or layout property reads.

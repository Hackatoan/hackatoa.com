## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.

## 2024-05-18 - Layout thrashing in scroll-jacking logic
**Learning:** In the custom scroll-jacking carousel implementation (`handleWheel`), reading layout properties like `scrollTop` and `clientHeight` while a 550ms CSS slide transition was active caused synchronous layout recalculation on every rapid wheel tick. This blocks the main thread and causes severe animation jank.
**Action:** Always ensure that early-exit conditions (like `isSliding` state checks) are placed *before* any DOM traversal (`element.closest`) or layout property reads (`scrollTop`, `offsetHeight`, etc.) to keep event handler time complexity O(1) during active animations.

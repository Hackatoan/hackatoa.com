## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.

## 2026-04-27 - Prevent Layout Thrashing During Wheel Events
**Learning:** DOM traversals and layout property reads (`scrollTop`, `clientHeight`) on rapid high-frequency events like `wheel` cause forced synchronous layout (layout thrashing) and animation jank if triggered during CSS transitions.
**Action:** Ensure early-exit state checks (like `isSliding`) are positioned *before* any DOM lookups or layout reads to preserve 60FPS animations.

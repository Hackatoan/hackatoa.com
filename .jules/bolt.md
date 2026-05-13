## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2026-04-17 - DocumentFragment for DOM Batching
**Learning:** Appending elements directly to the DOM within loops causes excessive reflows and repaints, which is a performance bottleneck for list rendering.
**Action:** Use `DocumentFragment` to batch DOM appends outside of the loop to minimize performance overhead.

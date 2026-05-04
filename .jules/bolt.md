## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2024-05-04 - Batch DOM Insertion with DocumentFragment
**Learning:** Creating elements iteratively and appending them to the DOM directly triggers continuous reflows and repaints, severely hindering main thread performance on large lists like blogs and github feeds.
**Action:** Use a `DocumentFragment` inside loops to batch DOM insertions entirely in memory, appending the fragment to the live DOM exactly once.

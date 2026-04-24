## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2026-04-08 - Batched DOM insertions with DocumentFragment
**Learning:** Frequent loop-based `appendChild` calls in JavaScript (e.g., generating blog entries, mycology carousels, or github events) cause significant layout thrashing, resulting in costly forced reflows and repaints in the browser.
**Action:** Always batch DOM element creation by pushing children into a `DocumentFragment` first, then append the single fragment to the live DOM at the end of the loop to minimize reflows.

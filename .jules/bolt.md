## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2024-05-18 - DocumentFragment DOM insertion batching
**Learning:** Creating a `DocumentFragment` to batch DOM insertions limits browser layout thrashing compared to appending children sequentially directly into the active DOM within a loop.
**Action:** Use `DocumentFragment` to aggregate multiple DOM nodes before inserting them into a mounted parent container, and update `node:vm` mocked `appendChild` functions to properly flatten these fragments.

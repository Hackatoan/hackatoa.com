## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2026-05-12 - Batched DOM Manipulations with DocumentFragment
**Learning:** Appending elements one by one directly into the DOM (e.g., inside a `.forEach` loop) triggers multiple browser reflows and repaints, which is a performance bottleneck for long lists.
**Action:** Use a `DocumentFragment` to batch DOM node additions inside loops and append the fragment to the DOM container all at once.

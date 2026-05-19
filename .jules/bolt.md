## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2026-04-17 - DocumentFragment for DOM Batching
**Learning:** Appending elements directly to the DOM within loops causes excessive reflows and repaints, which is a performance bottleneck for list rendering.
**Action:** Use `DocumentFragment` to batch DOM appends outside of the loop to minimize performance overhead.
## 2026-04-18 - Cache Intl.DateTimeFormat instantiations
**Learning:** Instantiating `Intl.DateTimeFormat` is an expensive operation. Creating it repeatedly inside loops or intervals causes unnecessary CPU overhead.
**Action:** Cache and reuse `Intl.DateTimeFormat` instances outside of frequently called functions to improve formatting performance.
## 2026-04-18 - O(1) Set Lookup for Indefinitely Growing Arrays
**Learning:** The 'history' array in 'public/motd.json' grows indefinitely with every daily update. Using 'history.some()' inside iterative loops causes O(N) performance degradation over time.
**Action:** Always use a pre-calculated 'Set' for membership checks inside iterative loops on growing arrays to ensure O(1) lookup complexity.

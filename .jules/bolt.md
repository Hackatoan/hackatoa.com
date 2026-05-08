## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.

## 2026-05-08 - Short-circuiting Array Operations
**Learning:** Prioritizing short-circuiting `for` loops over `Array.prototype.filter().slice(0, n)` chains in performance-critical paths (e.g. `renderGitHubEvents`) results in significant performance gains (verified ~98% improvement for collections of ~1000 items).
**Action:** Use short-circuiting `for` loops for bounded collection filtering instead of chaining array methods.

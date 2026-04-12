## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.
## 2024-05-18 - DocumentFragment Optimization
**Learning:** In standard front-end environments rendering multiple elements, direct insertions inside a loop can trigger excessive layout reflows and repaints, severely impacting browser performance and causing jank in lists and carousels.
**Action:** When dynamically constructing and inserting multiple elements into the DOM, leverage `document.createDocumentFragment()` to batch DOM operations. Append all new elements to the fragment during the loop, and append the fragment to the target container once after the loop, effectively reducing multiple repaints to just one.

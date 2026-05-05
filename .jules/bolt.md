## 2026-04-07 - Cached GitHub API Feed Response
**Learning:** External API fetch logic on every load creates a bottleneck. Implementing local storage caching reduces network wait time and respects unauthenticated rate limits.
**Action:** Use a standardized cached fallback for non-critical widget fetching to eliminate rendering blockages.

## 2026-05-05 - Avoid layout thrashing in high-frequency events
**Learning:** Performing DOM traversals (`e.target.closest`) and layout property reads (`scrollTop`, `clientHeight`, `scrollHeight`) in a high-frequency event like `wheel` before checking early-exit states (like `isSliding`) causes unnecessary forced synchronous layouts (layout thrashing) and animation jank.
**Action:** Always check boolean early-exit states *before* performing expensive DOM measurements or traversals in high-frequency event listeners.

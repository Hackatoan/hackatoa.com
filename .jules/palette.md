## 2025-02-17 - Interactive Copy to Clipboard for Crypto Addresses
**Learning:** Static cryptographic strings (like wallet addresses) require precise text selection, which is error-prone on mobile devices and tedious for users. Relying on manual copy creates friction.
**Action:** Always wrap static utility strings in interactive button elements with the Clipboard API and visual feedback to provide a seamless copy experience.
## 2024-05-24 - Loading States & Toggle Semantics
**Learning:** Async components (like GitHub feed) without initial loading states in HTML cause empty layouts before data fetch completes. Additionally, icon-only toggle buttons lose their state context for screen readers if `aria-pressed` is not synchronized with visual class changes.
**Action:** Always provide an initial static loading placeholder in HTML for async components to assure users data is coming, and always synchronize `aria-pressed` on custom toggle buttons.

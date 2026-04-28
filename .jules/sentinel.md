## 2024-05-18 - [HIGH] XSS Vulnerability in GitHub Feed Renderer
**Vulnerability:** The application was fetching recent GitHub events from the public API (`https://api.github.com/users/Hackatoan/events/public`) and injecting the resulting commit messages directly into the DOM using `innerHTML` with a weak string replace (`replace(/</g, "&lt;").replace(/>/g, "&gt;")`) as an attempt to sanitize input. This was an incomplete mitigation strategy and potentially exposed the client to Cross-Site Scripting (XSS) if commit messages contained other unescaped characters or payload structures.
**Learning:** `innerHTML` should be stringently avoided for any user-provided or externally sourced content, even if some form of sanitization is attempted using basic Regex replacements. The external content could come in formats not anticipated by the simple filter.
**Prevention:** Use safer DOM manipulation APIs such as `document.createElement()` along with `textContent` or `innerText` to set the values. These attributes natively instruct the browser to treat the content safely as text rather than parsing it as markup, entirely mitigating the risk of DOM-based XSS injection.## 2026-04-16 - Safe bare relative paths in sanitizeUrl
**Vulnerability:** sanitizeUrl strictly filtered out bare relative URLs while permitting protocol-relative URLs.
**Learning:** URL sanitizers using startsWith conditions might overlook bare relative paths and allow external URLs beginning with //.
**Prevention:** In sanitizeUrl, explicitly drop protocol-relative URLs (starts with '//') and allow bare relative paths by validating they do not contain colons (!includes(':')), avoiding both open redirects and broken image src attributes.

## 2024-05-24 - [HIGH] Protocol-Relative URL Bypass in sanitizeUrl
**Vulnerability:** The `sanitizeUrl` function attempted to block protocol-relative URLs (`//evil.com`) by checking if the trimmed URL `startsWith('//')`. However, an attacker could bypass this by using backslashes (`\\\\evil.com` or `/\\evil.com`), which browsers often normalize to forward slashes before making the request. This allows for open redirection or loading malicious scripts/images.
**Learning:** Checking for `startsWith('//')` is insufficient for blocking protocol-relative URLs because browsers normalize backslashes (`\`) to forward slashes (`/`).
**Prevention:** Normalize backslashes to forward slashes (`replace(/\\\\/g, '/')`) before checking `startsWith('//')` and other conditions in `sanitizeUrl`.

## 2024-05-24 - [MEDIUM] Missing noopener on target="_blank" links
**Vulnerability:** Several links in `public/index.html` and `public/app.js` used `target="_blank"` without the `rel="noopener"` attribute. This allows the newly opened tab to access the original page's `window` object via `window.opener`, potentially enabling malicious pages to navigate the original tab to a phishing site (tabnabbing) or execute other attacks.
**Learning:** Any link using `target="_blank"` must include `rel="noopener noreferrer"` to sever the connection between the current page and the opened page.
**Prevention:** Always include `rel="noopener noreferrer"` when creating `target="_blank"` links, both in static HTML and dynamically generated links in JavaScript.

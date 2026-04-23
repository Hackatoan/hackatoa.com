// Basic scroll interaction and music widget wiring

const musicToggle = document.getElementById('music-toggle');
const bgToggle = document.getElementById('bg-toggle');
const slidesTrack = document.querySelector('.slides-track');
const slides = slidesTrack
    ? Array.from(slidesTrack.querySelectorAll('.slide:not([data-hidden="true"])'))
    : [];

let currentSlideIndex = 0;
let isSliding = false;
const SLIDE_DURATION_MS = 550;

/**
 * Adds keyboard support for interactive elements that should trigger a click on Enter or Space.
 * @param {HTMLElement} element The element to add keyboard support to.
 */
function addKeyboardClickSupport(element) {
    if (!element) return;
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            element.click();
        }
    });
}


/**
 * Validates a URL to ensure it uses a safe protocol.
 * Returns the original URL if safe, or a fallback if potentially malicious.
 * @param {string} urlString The URL to validate.
 * @param {string} fallback The fallback to use if the URL is unsafe (defaults to '#').
 * @returns {string} The safe URL or fallback.
 */
function sanitizeUrl(urlString, fallback = '#') {
    if (!urlString) return fallback;
    const trimmed = urlString.trim();

    // Deny protocol-relative URLs
    if (trimmed.startsWith('//')) return fallback;

    // Deny malicious protocols
    if (/^(javascript|data|vbscript):/i.test(trimmed)) return fallback;

    // Allow relative paths, http, and https protocols, and paths without a colon (bare relative paths)
    if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../') || /^https?:\/\//i.test(trimmed) || !trimmed.includes(':')) {
        return trimmed;
    }
    return fallback;
}


function goToSlide(index) {
    // On mobile we fall back to natural vertical scrolling; skip carousel logic.
    if (window.innerWidth <= 768) return;
    if (!slides.length) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    if (clamped === currentSlideIndex) return;
    currentSlideIndex = clamped;
    isSliding = true;

    const viewport = document.querySelector('.slides-viewport');
    if (viewport && slidesTrack) {
        const width = viewport.clientWidth;
        const offset = -currentSlideIndex * width;
        slidesTrack.style.transition = `transform ${SLIDE_DURATION_MS}ms ease`;
        slidesTrack.style.transform = `translateX(${offset}px)`;
        window.scrollTo(0, 0);
        window.setTimeout(() => {
            isSliding = false;
        }, SLIDE_DURATION_MS);
    } else {
        isSliding = false;
    }
}

function handleWheel(e) {
    if (window.innerWidth <= 768) return;
    if (!slides.length) return;

    // Bolt: Early exit on state check to prevent layout thrashing and animation jank
    if (isSliding) {
        e.preventDefault();
        return;
    }

    // If hovering over a vertically scrollable area and scrolling vertically, let native handle it
    const scrollTarget = e.target.closest('.blog-list, .github-pinner, .contact-input');
    if (scrollTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Optionally detect top/bottom bounds, but simple ignore is usually best for UX
        const isAtTop = scrollTarget.scrollTop === 0;
        const isAtBottom = Math.ceil(scrollTarget.scrollTop + scrollTarget.clientHeight) >= scrollTarget.scrollHeight;

        if (e.deltaY > 0 && !isAtBottom) return; // scrolling down, not at bottom
        if (e.deltaY < 0 && !isAtTop) return;    // scrolling up, not at top
    }
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 10) return;
    e.preventDefault();
    goToSlide(currentSlideIndex + (delta > 0 ? 1 : -1));
}

function handleKey(e) {
    if (window.innerWidth <= 768) return;
    if (!slides.length) return;
    if (isSliding) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToSlide(currentSlideIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToSlide(currentSlideIndex - 1);
    }
}

// YouTube Music widget
/* global YT */
let ytPlayer;

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('music-player', {
        height: '0',
        width: '0',
        playerVars: {
            'listType': 'playlist',
            'list': 'PLZG0CvngYU9ihzPO2JTRe17DQDUI0Z6vC',
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'modestbranding': 1,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady() {
    const volumeSlider = document.getElementById('music-volume');
    if (volumeSlider) {
        let savedVol = parseInt(volumeSlider.value, 10);
        if (!isNaN(savedVol)) {
            ytPlayer.setVolume(savedVol);
        }
    }

    ytPlayer.setShuffle(true);

    // Removed broken autoPlay block that had no localAudioPlayer or autoPlay variables defined in this scope.
    // Kept the function valid by removing the extra bracket.
}

function updateTitle() {
    const titleEl = document.querySelector('.music-title');
    if (titleEl) {
        const title = ytPlayer?.getVideoData?.()?.title;
        if (title) {
            titleEl.textContent = title;
        }
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        if (musicToggle) {
            musicToggle.dataset.state = 'playing';
            musicToggle.textContent = 'Pause';
        }
        updateTitle();
    } else if (event.data === YT.PlayerState.PAUSED) {
        if (musicToggle) {
            musicToggle.dataset.state = 'paused';
            musicToggle.textContent = 'Play';
        }
    }
}

function initMusicWidget() {
    const volumeSlider = document.getElementById('music-volume');
    const skipBtn = document.getElementById('music-skip');

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            if (ytPlayer && ytPlayer.setVolume) {
                ytPlayer.setVolume(parseInt(e.target.value, 10));
            }
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            if (ytPlayer && ytPlayer.nextVideo) {
                ytPlayer.nextVideo();
            }
        });
    }

    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (!ytPlayer || !ytPlayer.getPlayerState) return;
            const state = ytPlayer.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                ytPlayer.pauseVideo();
            } else {
                ytPlayer.playVideo();
            }
        });
    }
}

function initBackgroundToggle() {
    if (!bgToggle) return;
    bgToggle.addEventListener('click', () => {
        document.body.classList.toggle('bg-viewing');
    });
}

// Blog rendering from external data file
function renderBlogFromData() {
    const container = document.getElementById('blog-list');
    if (!container) return;

    const entries = Array.isArray(window.BLOG_ENTRIES) ? window.BLOG_ENTRIES : [];
    container.innerHTML = '';

    if (entries.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'blog-placeholder';
        placeholder.textContent = 'No entries found';
        placeholder.style.padding = '2rem';
        placeholder.style.textAlign = 'center';
        placeholder.style.color = 'var(--text-muted)';
        placeholder.style.border = '1px dashed rgba(114, 124, 188, 0.4)';
        placeholder.style.borderWidth = '1px';
        placeholder.style.borderRadius = '0.9rem';
        container.appendChild(placeholder);
        return;
    }

    entries.forEach((entry) => {
        const article = document.createElement('article');
        article.className = 'blog-entry';

        const titleEl = document.createElement('div');
        titleEl.className = 'blog-entry-title';
        titleEl.textContent = entry.title || '';
        article.appendChild(titleEl);

        if (entry.meta) {
            const metaEl = document.createElement('div');
            metaEl.className = 'blog-entry-meta';
            metaEl.textContent = entry.meta;
            article.appendChild(metaEl);
        }

        if (entry.image) {
            const img = document.createElement('img');
            img.src = sanitizeUrl(entry.image, '');
            img.alt = entry.imageAlt || entry.title || 'Blog entry image';
            img.loading = 'lazy';
            article.appendChild(img);
        }

        if (entry.body) {
            const bodyP = document.createElement('p');
            bodyP.textContent = entry.body;
            article.appendChild(bodyP);
        }

        if (entry.audio) {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = sanitizeUrl(entry.audio, '');
            audio.style.marginTop = '0.4rem';
            article.appendChild(audio);
        }

        if (Array.isArray(entry.links) && entry.links.length) {
            const linksRow = document.createElement('div');
            linksRow.className = 'link-row';
            entry.links.forEach((link) => {
                const safeHref = sanitizeUrl(link?.href);
                if (safeHref === '#') return;
                const a = document.createElement('a');
                a.className = 'pill-link';
                a.href = safeHref;
                a.target = '_blank';
                a.rel = 'noreferrer';
                a.textContent = link.label || link.href;
                linksRow.appendChild(a);
            });
            article.appendChild(linksRow);
        }

        container.appendChild(article);
    });
}

function initMycoCarousel() {
    const track = document.getElementById('myco-carousel-track');
    const dotsContainer = document.getElementById('myco-dots');
    const arrows = document.querySelectorAll('.myco-arrow');
    if (!track || !dotsContainer) return;

    // Load data from external file
    const items = Array.isArray(window.MUSHROOMS_DATA) ? window.MUSHROOMS_DATA : [];
    if (!items.length) return;

    items.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'myco-slide';

        const img = document.createElement('img');
        img.src = sanitizeUrl(item.image, '');
        img.alt = item.alt || 'Mycology image';
        img.loading = 'eager';
        img.tabIndex = 0;
        img.role = 'button';
        img.setAttribute('aria-label', 'Open image in modal');

        const overlay = document.createElement('div');
        overlay.className = 'myco-overlay';

        const title = document.createElement('div');
        title.className = 'myco-title';
        title.textContent = item.title;

        const meta = document.createElement('div');
        meta.className = 'myco-meta';
        meta.textContent = item.meta;

        overlay.appendChild(title);
        overlay.appendChild(meta);
        slide.appendChild(img);
        slide.appendChild(overlay);
        track.appendChild(slide);

        img.addEventListener('click', () => {
            const modal = document.getElementById('myco-modal');
            const modalImg = document.getElementById('myco-modal-img');
            if (modal && modalImg) {
                // img.src is already sanitized when the slide is created
                modalImg.src = img.src;
                modal.classList.add('show');
                const closeBtn = document.getElementById('myco-modal-close');
                if (closeBtn) closeBtn.focus();
            }
        });
        addKeyboardClickSupport(img);

        const dot = document.createElement('span');
        dot.className = index === 0 ? 'myco-dot active' : 'myco-dot';
        dot.dataset.index = index;
        dot.tabIndex = 0;
        dot.role = 'button';
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        if (index === 0) dot.setAttribute('aria-current', 'true');
        dot.addEventListener('click', () => {
            currentMycoIndex = index;
            updateMycoCarousel(track, currentMycoIndex);
        });
        addKeyboardClickSupport(dot);
        dotsContainer.appendChild(dot);
    });

    let currentMycoIndex = 0;

    arrows.forEach((btn) => {
        btn.addEventListener('click', () => {
            currentMycoIndex = btn.dataset.dir === 'prev'
                ? Math.max(0, currentMycoIndex - 1)
                : Math.min(items.length - 1, currentMycoIndex + 1);
            updateMycoCarousel(track, currentMycoIndex);
        });
    });

    // Modal close logic
    const modal = document.getElementById('myco-modal');
    const modalCloseBtn = document.getElementById('myco-modal-close');

    if (modal && modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
        addKeyboardClickSupport(modalCloseBtn);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                modal.classList.remove('show');
            }
        });
    }
}

function updateArrowState(btn, isDisabled) {
    btn.disabled = isDisabled;
    btn.style.opacity = isDisabled ? '0.3' : '1';
    btn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
}

// Cache the DOM elements since they do not change after initialization
let cachedMycoDots = null;
let cachedMycoArrows = null;

function updateMycoCarousel(track, currentMycoIndex) {
    const items = Array.isArray(window.MUSHROOMS_DATA) ? window.MUSHROOMS_DATA : [];
    const offset = -(currentMycoIndex * 100);
    track.style.transform = `translateX(${offset}%)`;

    if (!cachedMycoDots) cachedMycoDots = document.querySelectorAll('.myco-dot');

    cachedMycoDots.forEach((d, i) => {
        if (i === currentMycoIndex) {
            d.classList.add('active');
            d.setAttribute('aria-current', 'true');
        } else {
            d.classList.remove('active');
            d.removeAttribute('aria-current');
        }
    });

    if (!cachedMycoArrows) cachedMycoArrows = document.querySelectorAll('.myco-arrow');

    cachedMycoArrows.forEach((btn) => {
        if (btn.dataset.dir === 'prev') {
            updateArrowState(btn, currentMycoIndex === 0);
        } else {
            updateArrowState(btn, currentMycoIndex === items.length - 1);
        }
    });
}

// Global scope initialization trick for arrows
// (They are updated right after creation above, but doing an initial pass here)
document.addEventListener('DOMContentLoaded', () => {
    const arrows = document.querySelectorAll('.myco-arrow');
    const items = Array.isArray(window.MUSHROOMS_DATA) ? window.MUSHROOMS_DATA : [];
    arrows.forEach((btn) => {
        if (btn.dataset.dir === 'prev') {
            updateArrowState(btn, true);
        } else if (items.length <= 1) {
            updateArrowState(btn, true);
        }
    });
});

function renderGitHubEvents(container, events) {
    container.innerHTML = '';
    // Filter push and create events, limit to 5
    const relevantEvents = events.filter(e => e.type === 'PushEvent' || e.type === 'CreateEvent').slice(0, 5);

    if (relevantEvents.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'gh-placeholder';
        placeholder.textContent = 'No recent activity found.';
        container.appendChild(placeholder);
        return;
    }

    relevantEvents.forEach(event => {
        const item = document.createElement('div');
        item.className = 'gh-event';

        const typeLabel = event.type === 'PushEvent' ? 'Pushed to' : 'Created';
        const repoName = event.repo.name;
        const date = new Date(event.created_at).toLocaleDateString();

        const headerDiv = document.createElement('div');
        headerDiv.className = 'gh-header';

        const typeSpan = document.createElement('span');
        typeSpan.className = 'gh-type';
        typeSpan.textContent = typeLabel;

        const repoLink = document.createElement('a');
        repoLink.href = `https://github.com/${repoName}`;
        repoLink.target = '_blank';
        repoLink.rel = 'noreferrer';
        repoLink.className = 'gh-repo';
        repoLink.textContent = repoName;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'gh-time';
        timeSpan.textContent = date;

        headerDiv.appendChild(typeSpan);
        headerDiv.appendChild(repoLink);
        headerDiv.appendChild(timeSpan);

        item.appendChild(headerDiv);

        if (event.type === 'PushEvent' && event.payload.commits && event.payload.commits.length > 0) {
            const commitDiv = document.createElement('div');
            commitDiv.className = 'gh-commit';
            // Using textContent naturally escapes text to prevent XSS
            commitDiv.textContent = event.payload.commits[0].message;
            item.appendChild(commitDiv);
        }

        container.appendChild(item);
    });
}

function initGitHubFeed() {
    const container = document.querySelector('.github-pinner');
    if (!container) return;

    const cacheKey = 'github-events-cache';
    const cacheTimeKey = 'github-events-cache-time';
    const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    let cachedData = null;
    let cachedTime = null;

    try {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) cachedData = JSON.parse(cachedRaw);
        cachedTime = localStorage.getItem(cacheTimeKey);
    } catch {
        // Ignore localStorage access or parse errors
    }

    // Use cached data to save API call and speed up rendering
    if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime, 10)) < CACHE_DURATION_MS) {
        renderGitHubEvents(container, cachedData);
        return;
    }

    fetch('https://api.github.com/users/Hackatoan/events/public')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(events => {
            // Cache the result for future visits
            try {
                localStorage.setItem(cacheKey, JSON.stringify(events));
                localStorage.setItem(cacheTimeKey, Date.now().toString());
            } catch {
                // Ignore localStorage quota or access errors
            }

            renderGitHubEvents(container, events);
        })
        .catch(error => {
            console.error('Error fetching GitHub events:', error);
            // Fallback to stale cache if API fails
            if (cachedData) {
                renderGitHubEvents(container, cachedData);
            } else {
                // Hardcoded fallback data to prevent empty section on rate limit
                const fallbackData = [
                    {
                        type: 'PushEvent',
                        repo: { name: 'Hackatoan/hackatoa.com' },
                        created_at: new Date().toISOString(),
                        payload: {
                            commits: [
                                { message: 'Update security configurations and CMS data' }
                            ]
                        }
                    }
                ];
                renderGitHubEvents(container, fallbackData);
            }
        });
}

// MOTD System
async function initMOTD() {
    const motdBody = document.getElementById('motd-body');
    if (!motdBody) return;

    try {
        const response = await fetch('/motd.json');
        if (!response.ok) {
            throw new Error('MOTD file not found or unreadable');
        }
        const data = await response.json();
        if (data && data.message) {
            motdBody.textContent = data.message;
        } else {
            motdBody.textContent = "Stay curious. Keep building.";
        }
    } catch (error) {
        console.error('Error fetching MOTD:', error);
        motdBody.textContent = "Stay curious. Keep building.";
    }
}

// Contact time loop
function updateTimes(localEl, ptEl) {
    if (!localEl || !ptEl) return;

    const now = new Date();

    const localStr = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(now);

    const ptStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(now);

    localEl.textContent = localStr;
    ptEl.textContent = ptStr;
}

function initContactTimes() {
    const localEl = document.getElementById('contact-local-time');
    const ptEl = document.getElementById('contact-pt-time');

    if (!localEl || !ptEl) return;

    updateTimes(localEl, ptEl);
    window.setInterval(() => updateTimes(localEl, ptEl), 30_000);
}

window.addEventListener('DOMContentLoaded', () => {
    initMOTD();
    initMusicWidget();
    initBackgroundToggle();
    renderBlogFromData();
    initMycoCarousel();
    initGitHubFeed();
    initContactTimes();
    function setupSlideNavigation(selector, onBeforeGoToSlide) {
        const links = Array.from(document.querySelectorAll(selector));
        links.forEach((link) => {
            const targetId = link.getAttribute('href')?.slice(1);
            if (!targetId) return;
            const targetIndex = slides.findIndex((s) => s.id === targetId);
            if (targetIndex === -1) return;
            link.addEventListener('click', (e) => {
                if (onBeforeGoToSlide) onBeforeGoToSlide();
                if (window.innerWidth <= 768) return;
                e.preventDefault();
                if (!isSliding) goToSlide(targetIndex);
            });
        });
    }

    setupSlideNavigation('.nav-links a[href^="#"]', () => {
        document.body.classList.remove('bg-viewing');
    });

    setupSlideNavigation('.slides-viewport a[href^="#"]');

    if (window.innerWidth > 768 && slides.length) {
        slides.forEach((slide, index) => {
            slide.addEventListener('click', () => {
                if (!isSliding) goToSlide(index);
            });
        });
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKey);

    if (window.innerWidth > 768 && slides.length) {
        // Immediately kill any browser-native hash scroll that fired before JS ran
        window.scrollTo(0, 0);

        // If there's a hash in the URL, land on that slide instead of always #0
        const initHash = window.location.hash?.slice(1);
        const initIndex = initHash ? slides.findIndex(s => s.id === initHash) : -1;
        currentSlideIndex = initIndex >= 0 ? initIndex : 0;

        // Apply position instantly (no animation on first load)
        const viewport = document.querySelector('.slides-viewport');
        if (viewport && slidesTrack) {
            const offset = -currentSlideIndex * viewport.clientWidth;
            slidesTrack.style.transition = 'none';
            slidesTrack.style.transform = `translateX(${offset}px)`;
        }
    }

    // Handle back/forward browser navigation via hash changes
    window.addEventListener('hashchange', () => {
        if (window.innerWidth <= 768) return;
        const hash = window.location.hash?.slice(1);
        if (!hash) return;
        const index = slides.findIndex(s => s.id === hash);
        if (index !== -1) {
            window.scrollTo(0, 0);
            goToSlide(index);
        }
    });
});

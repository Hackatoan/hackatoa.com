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
    // eslint-disable-next-line no-control-regex
    const sanitized = urlString.replace(/[\x00-\x1F\x7F]+/g, '').replace(/\\/g, '/');
    const trimmed = sanitized.trim();

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

    // Early exit before DOM traversal/layout reads to prevent layout thrashing
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
    // Don't hijack keyboard in form fields
    const activeTag = document.activeElement?.tagName ?? '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) || document.activeElement?.isContentEditable) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToSlide(currentSlideIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToSlide(currentSlideIndex - 1);
    }
}

// Music widget — streams from Hackatoan/records via GitHub raw CDN
const TRACKS = [
    { title: '40kb Memory',               src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/40kb%20Memory.mp3',               album: 'Trial 1' },
    { title: 'Bad Condition',             src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Bad%20Condition.mp3',             album: 'Trial 1' },
    { title: 'Buffer Stream Blue',        src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Buffer%20Stream%20Blue.mp3',        album: 'Trial 1' },
    { title: 'Cursor Trail',              src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Cursor%20Trail.mp3',              album: 'Trial 1' },
    { title: 'Desktop Meadow',            src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Desktop%20Meadow.mp3',            album: 'Trial 1' },
    { title: 'Dial-Up Lullaby',           src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Dial-Up%20Lullaby.mp3',           album: 'Trial 1' },
    { title: 'Heart Not Found',           src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Heart%20Not%20Found.mp3',           album: 'Trial 1' },
    { title: 'Pink Guestbook',            src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Pink%20Guestbook.mp3',            album: 'Trial 1' },
    { title: 'Under Construction Forever',src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Under%20Construction%20Forever.mp3',album: 'Trial 1' },
    { title: 'Winamp Visualiser',         src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Winampvisualiser.mp3',            album: 'Trial 1' },
    { title: 'Half Asleep',               src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Half%20Asleep.mp3',               album: 'Trial 1' },
    { title: 'Slow Scroll',               src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Slow%20Scroll.mp3',               album: 'Trial 1' },
    { title: 'Rain on the Blue Chair',    src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Rain%20on%20the%20Blue%20Chair.mp3',album: 'Trial 1' },
    { title: 'Pocket Reset',              src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Pocket%20Reset.mp3',              album: 'Trial 1' },
    { title: 'Rain On Glass',             src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Rain%20On%20Glass.mp3',            album: 'Trial 1' },
    { title: 'Comic Sans Heart',          src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Comic%20Sans%20Heart.mp3', album: 'Wayback Machine' },
    { title: 'Default Background',        src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Default%20Background.mp3', album: 'Wayback Machine' },
    { title: 'Equalizer Bars',            src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Equalizer%20Bars.mp3',    album: 'Wayback Machine' },
    { title: 'Geocities Ghost',           src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Geocities%20Ghost.mp3',   album: 'Wayback Machine' },
    { title: 'Last Modified',             src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Last%20Modified.mp3',     album: 'Wayback Machine' },
    { title: 'Loading Forever',           src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Loading%20Forever.mp3',   album: 'Wayback Machine' },
    { title: 'Modem Hymn',               src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Modem%20Hymn.mp3',        album: 'Wayback Machine' },
    { title: 'Profile Deactivated',       src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Profile%20Deactivated.mp3',album: 'Wayback Machine' },
    { title: 'Static Room',              src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Static%20Room.mp3',       album: 'Wayback Machine' },
    { title: 'Yellow Tape Sign',          src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Yellow%20Tape%20Sign.mp3',album: 'Wayback Machine' },
];

const audio = new Audio();
let shuffleOrder = [];
let trackIndex = 0;

function shuffleTracks(lastTrackIndex) {
    // Fisher-Yates shuffle
    const arr = [...Array(TRACKS.length).keys()];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Ensure the first song of the new cycle isn't the same as the last
    if (lastTrackIndex !== undefined && arr[0] === lastTrackIndex && arr.length > 1) {
        [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    shuffleOrder = arr;
    trackIndex = 0;
}

function loadTrack(idx) {
    // When we've exhausted the shuffle order, reshuffle for the next cycle
    if (idx >= TRACKS.length) {
        const lastPlayed = shuffleOrder[TRACKS.length - 1];
        shuffleTracks(lastPlayed);
        idx = 0;
    }
    trackIndex = idx;
    const track = TRACKS[shuffleOrder[idx]];
    audio.src = track.src;
    const titleEl = document.querySelector('.music-title');
    if (titleEl) titleEl.textContent = track.title;
}

function saveMusicState() {
    try {
        sessionStorage.setItem('hackatoa_player', JSON.stringify({
            src: audio.src,
            trackIdx: trackIndex,
            time: audio.currentTime,
            paused: audio.paused,
            volume: audio.volume,
            shuffleOrder: shuffleOrder,
            trackIndex: trackIndex,
        }));
    } catch(e) {}
}

function restoreMusicState() {
    try {
        const s = JSON.parse(sessionStorage.getItem('hackatoa_player'));
        if (!s || !s.src) return false;
        if (s.shuffleOrder) shuffleOrder = s.shuffleOrder;
        if (s.trackIndex != null) trackIndex = s.trackIndex;
        audio.src = s.src;
        audio.volume = s.volume != null ? s.volume : 0.25;
        audio.currentTime = s.time || 0;
        if (!s.paused) audio.play().catch(() => {});
        const titleEl = document.querySelector('.music-title');
        const track = TRACKS.find(t => t.src === s.src);
        if (titleEl && track) titleEl.textContent = track.title;
        return true;
    } catch(e) { return false; }
}

function initMusicWidget() {
    const restored = restoreMusicState();
    if (!restored) shuffleTracks();

    const volumeSlider = document.getElementById('music-volume');
    const skipBtn = document.getElementById('music-skip');

    // Sync volume slider to current audio volume
    if (volumeSlider) volumeSlider.value = Math.round(audio.volume * 100);
    else audio.volume = 0.25;

    audio.addEventListener('ended', () => {
        loadTrack(trackIndex + 1);
        audio.play().catch(() => {});
        saveMusicState();
    });

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = parseInt(e.target.value, 10) / 100;
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            const wasPlaying = !audio.paused;
            loadTrack(trackIndex + 1);
            if (wasPlaying) audio.play().catch(() => {});
        });
    }

    audio.addEventListener('play', () => {
        if (musicToggle) { musicToggle.dataset.state = 'playing'; musicToggle.textContent = 'Pause'; }
        saveMusicState();
    });
    audio.addEventListener('pause', () => {
        if (musicToggle) { musicToggle.dataset.state = 'paused'; musicToggle.textContent = 'Play'; }
        saveMusicState();
    });

    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (audio.paused) {
                if (!audio.src) loadTrack(trackIndex);
                audio.play().catch(() => {});
            } else {
                audio.pause();
            }
        });
    }
    window.addEventListener('beforeunload', saveMusicState);
    window.addEventListener('pagehide', saveMusicState);
}

function initBackgroundToggle() {
    if (!bgToggle) return;
    bgToggle.addEventListener('click', () => {
        document.body.classList.toggle('bg-viewing');
        const isViewing = document.body.classList.contains('bg-viewing');
        bgToggle.setAttribute('aria-pressed', isViewing.toString());
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
        placeholder.style.border = '1px dashed rgba(172, 94, 117, 0.4)';
        placeholder.style.borderWidth = '1px';
        placeholder.style.borderRadius = '0.9rem';
        container.appendChild(placeholder);
        return;
    }

    const fragment = document.createDocumentFragment();

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
                a.rel = 'noopener noreferrer';
                a.textContent = link.label || link.href;
                linksRow.appendChild(a);
            });
            article.appendChild(linksRow);
        }

        fragment.appendChild(article);
    });

    container.appendChild(fragment);
}






function parseSongsFromSheetResponse(text) {
    const prefix = 'setResponse(';
    const start = text.indexOf(prefix);
    const end = text.lastIndexOf(');');

    if (start === -1 || end === -1 || end <= start + prefix.length) {
        throw new Error('Invalid songs response format');
    }

    const payload = JSON.parse(text.slice(start + prefix.length, end));
    const rows = payload?.table?.rows ?? [];

    return rows
        .map((row) => ({
            title: row?.c?.[0]?.v || '',
            lyrics: row?.c?.[1]?.v || '',
        }))
        .filter((song) => song.title || song.lyrics);
}

function renderSongs(container, songs) {
    container.innerHTML = '';

    if (!songs.length) {
        const empty = document.createElement('div');
        empty.className = 'text-yellow-200';
        empty.textContent = 'No songs available right now.';
        container.appendChild(empty);
        return;
    }

    songs
        .sort((a, b) => a.title.localeCompare(b.title))
        .forEach((song) => {
            const songElement = document.createElement('div');
            songElement.className = 'bg-black/50 border border-yellow-300 rounded-lg p-6';

            const title = document.createElement('h2');
            title.className = 'text-2xl text-yellow-300 mb-4';
            title.textContent = song.title || 'Untitled';
            songElement.appendChild(title);

            const lyricsWrapper = document.createElement('div');
            lyricsWrapper.className = 'space-y-2 text-yellow-100 leading-relaxed';
            const lines = (song.lyrics || 'No lyrics available').split('\n');

            lines.forEach((line) => {
                const p = document.createElement('p');
                p.textContent = line || ' ';
                lyricsWrapper.appendChild(p);
            });

            songElement.appendChild(lyricsWrapper);
            container.appendChild(songElement);
        });
}

async function initSongs() {
    const container = document.getElementById('songs-container');
    if (!container) return;

    try {
        const response = await fetch(
            'https://docs.google.com/spreadsheets/d/15U8Us6fNfLw9-YbWYnQPUQ6SpYxMbnOj5N6l6WgVvN8/gviz/tq?tqx=out:json&sheet=Songs',
        );
        if (!response.ok) throw new Error(`Songs fetch failed: ${response.status}`);
        const text = await response.text();
        const songs = parseSongsFromSheetResponse(text);
        renderSongs(container, songs);
    } catch (err) {
        console.error('Error loading songs:', err);
        container.innerHTML = '<div class="text-red-400">Unable to load songs right now.</div>';
    }
}

const githubDateFormatter = new Intl.DateTimeFormat();

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

    const fragment = document.createDocumentFragment();

    relevantEvents.forEach(event => {
        const item = document.createElement('div');
        item.className = 'gh-event';

        const typeLabel = event.type === 'PushEvent' ? 'Pushed to' : 'Created';
        const repoName = event.repo.name;
        const date = githubDateFormatter.format(new Date(event.created_at));

        const headerDiv = document.createElement('div');
        headerDiv.className = 'gh-header';

        const typeSpan = document.createElement('span');
        typeSpan.className = 'gh-type';
        typeSpan.textContent = typeLabel;

        const repoLink = document.createElement('a');
        repoLink.href = `https://github.com/${repoName}`;
        repoLink.target = '_blank';
        repoLink.rel = 'noopener noreferrer';
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

        fragment.appendChild(item);
    });

    container.appendChild(fragment);
}

/**
 * Retrieves an item from localStorage safely.
 * @param {string} key The localStorage key.
 * @param {boolean} parseJson Whether to parse the retrieved string as JSON.
 * @returns {any} The parsed JSON object, string, or null if not found or on error.
 */
function getStorageItem(key, parseJson = false) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return null;
        return parseJson ? JSON.parse(item) : item;
    } catch {
        // ignore error
        return null;
    }
}

/**
 * Sets an item in localStorage safely.
 * @param {string} key The localStorage key.
 * @param {any} value The value to store.
 * @param {boolean} stringifyJson Whether to stringify the value before storing.
 */
function setStorageItem(key, value, stringifyJson = false) {
    try {
        const itemToStore = stringifyJson ? JSON.stringify(value) : value;
        localStorage.setItem(key, itemToStore);
    } catch {
        // ignore error
    }
}

function initGitHubFeed() {
    const container = document.querySelector('.github-pinner');
    if (!container) return;

    const cacheKey = 'github-events-cache';
    const cacheTimeKey = 'github-events-cache-time';
    const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    const cachedData = getStorageItem(cacheKey, true);
    const cachedTime = getStorageItem(cacheTimeKey, false);

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
            setStorageItem(cacheKey, events, true);
            setStorageItem(cacheTimeKey, Date.now().toString(), false);

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

    // Viewer's local date as YYYY-MM-DD
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    try {
        const response = await fetch('/motd.json');
        if (!response.ok) {
            throw new Error('MOTD file not found or unreadable');
        }
        const data = await response.json();

        // data.date is the Kiritimati calendar date the message was generated for (YYYY-MM-DD)
        let message = null;

        if (data.date === localDate && data.message) {
            message = data.message;
        } else if (Array.isArray(data.history)) {
            // Find the most recent history entry matching the viewer's local date
            const match = [...data.history].reverse().find(e => e.date === localDate);
            if (match) message = match.message;
        }

        // Fall back to the current server message
        if (!message) message = data.message || "Stay curious. Keep building.";

        motdBody.textContent = message;
    } catch (error) {
        console.error('Error fetching MOTD:', error);
        motdBody.textContent = "Stay curious. Keep building.";
    }
}

// Contact time loop
// Performance optimization: Cache Intl.DateTimeFormat instances
// as instantiating them is expensive and updateTimes is called in a loop.
const localFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
});

const ptFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
});

function updateTimes(localEl, ptEl) {
    if (!localEl || !ptEl) return;

    const now = new Date();

    const localStr = localFormatter.format(now);
    const ptStr = ptFormatter.format(now);

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

function initWalletCopy() {
    const btn = document.getElementById('copy-wallet-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        try {
            const address = btn.dataset.address || btn.textContent.trim();
            if (!btn.dataset.address) btn.dataset.address = address;
            await navigator.clipboard.writeText(address);

            btn.textContent = 'Copied to clipboard! \u2713';
            btn.style.color = 'var(--primary-glow)';

            setTimeout(() => {
                btn.textContent = address;
                btn.style.color = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initMOTD();
    initSongs();
    initWalletCopy();
    initMusicWidget();
    initBackgroundToggle();
    renderBlogFromData();
    initGitHubFeed();
    initContactTimes();
    // ⚡ Bolt Optimization: Event delegation for slide navigation to prevent O(n) event listeners
    function setupSlideNavigation(containerSelector, onBeforeGoToSlide) {
        const containers = document.querySelectorAll(containerSelector);
        containers.forEach(container => {
            container.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (!link) return;

                const targetId = link.getAttribute('href')?.slice(1);
                if (!targetId) return;

                const targetIndex = slides.findIndex((s) => s.id === targetId);
                if (targetIndex === -1) return;

                if (onBeforeGoToSlide) onBeforeGoToSlide();
                if (window.innerWidth <= 768) return;
                e.preventDefault();
                if (!isSliding) goToSlide(targetIndex);
            });
        });
    }

    setupSlideNavigation('.nav-links', () => {
        document.body.classList.remove('bg-viewing');
    });

    setupSlideNavigation('.slides-viewport');

    if (window.innerWidth > 768 && slides.length && slidesTrack) {
        slidesTrack.addEventListener('click', (e) => {
            const slide = e.target.closest('.slide');
            if (!slide) return;
            const index = slides.indexOf(slide);
            if (index > -1 && !isSliding) goToSlide(index);
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



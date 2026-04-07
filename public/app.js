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

    // If hovering over a vertically scrollable area and scrolling vertically, let native handle it
    const scrollTarget = e.target.closest('.blog-list, .github-pinner, .contact-input');
    if (scrollTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Optionally detect top/bottom bounds, but simple ignore is usually best for UX
        const isAtTop = scrollTarget.scrollTop === 0;
        const isAtBottom = Math.ceil(scrollTarget.scrollTop + scrollTarget.clientHeight) >= scrollTarget.scrollHeight;

        if (e.deltaY > 0 && !isAtBottom) return; // scrolling down, not at bottom
        if (e.deltaY < 0 && !isAtTop) return;    // scrolling up, not at top
    }

    if (isSliding) {
        e.preventDefault();
        return;
    }
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 10) return;
    e.preventDefault();
    if (delta > 0) {
        goToSlide(currentSlideIndex + 1);
    } else if (delta < 0) {
        goToSlide(currentSlideIndex - 1);
    }
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
    if (titleEl && ytPlayer && ytPlayer.getVideoData) {
        const data = ytPlayer.getVideoData();
        if (data && data.title) {
            titleEl.textContent = data.title;
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
            img.src = entry.image;
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
            audio.src = entry.audio;
            audio.style.marginTop = '0.4rem';
            article.appendChild(audio);
        }

        if (Array.isArray(entry.links) && entry.links.length) {
            const linksRow = document.createElement('div');
            linksRow.className = 'link-row';
            entry.links.forEach((link) => {
                if (!link || !link.href) return;
                const a = document.createElement('a');
                a.className = 'pill-link';
                a.href = link.href;
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
        img.src = item.image;
        img.alt = item.alt || 'Mycology image';
        img.loading = 'lazy';

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
                modalImg.src = img.src;
                modal.classList.add('show');
            }
        });

        const dot = document.createElement('span');
        dot.className = index === 0 ? 'myco-dot active' : 'myco-dot';
        dot.dataset.index = index;
        dot.addEventListener('click', () => {
            currentMycoIndex = index;
            updateMycoCarousel(track, dotsContainer, currentMycoIndex);
        });
        dotsContainer.appendChild(dot);
    });

    let currentMycoIndex = 0;

    arrows.forEach((btn) => {
        btn.addEventListener('click', () => {
            const dir = btn.dataset.dir;
            if (dir === 'prev') {
                currentMycoIndex = Math.max(0, currentMycoIndex - 1);
            } else {
                currentMycoIndex = Math.min(items.length - 1, currentMycoIndex + 1);
            }
            updateMycoCarousel(track, dotsContainer, currentMycoIndex);
        });
    });

    // Modal close logic
    const modal = document.getElementById('myco-modal');
    const modalCloseBtn = document.getElementById('myco-modal-close');

    if (modal && modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
}

function updateMycoCarousel(track, dotsContainer, currentMycoIndex) {
    const items = Array.isArray(window.MUSHROOMS_DATA) ? window.MUSHROOMS_DATA : [];
    const offset = -(currentMycoIndex * 100);
    track.style.transform = `translateX(${offset}%)`;

    const allDots = dotsContainer.querySelectorAll('.myco-dot');
    allDots.forEach((d, i) => {
        if (i === currentMycoIndex) {
            d.classList.add('active');
        } else {
            d.classList.remove('active');
        }
    });

    const arrows = document.querySelectorAll('.myco-arrow');
    arrows.forEach((btn) => {
        if (btn.dataset.dir === 'prev') {
            btn.disabled = currentMycoIndex === 0;
            btn.style.opacity = currentMycoIndex === 0 ? '0.3' : '1';
            btn.style.cursor = currentMycoIndex === 0 ? 'not-allowed' : 'pointer';
        } else {
            btn.disabled = currentMycoIndex === items.length - 1;
            btn.style.opacity = currentMycoIndex === items.length - 1 ? '0.3' : '1';
            btn.style.cursor = currentMycoIndex === items.length - 1 ? 'not-allowed' : 'pointer';
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
            btn.disabled = true;
            btn.style.opacity = '0.3';
            btn.style.cursor = 'not-allowed';
        } else if (items.length <= 1) {
            btn.disabled = true;
            btn.style.opacity = '0.3';
            btn.style.cursor = 'not-allowed';
        }
    });
});

function initGitHubFeed() {
    const container = document.querySelector('.github-pinner');
    if (!container) return;

    fetch('https://api.github.com/users/Hackatoan/events/public')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(events => {
            container.innerHTML = '';
            // Filter push and create events, limit to 5
            const relevantEvents = events.filter(e => e.type === 'PushEvent' || e.type === 'CreateEvent').slice(0, 5);

            if (relevantEvents.length === 0) {
                container.innerHTML = '<div class="gh-placeholder">No recent activity found.</div>';
                return;
            }

            relevantEvents.forEach(event => {
                const item = document.createElement('div');
                item.className = 'gh-event';

                const typeLabel = event.type === 'PushEvent' ? 'Pushed to' : 'Created';
                const repoName = event.repo.name;
                const date = new Date(event.created_at).toLocaleDateString();

                let commitMsg = '';
                if (event.type === 'PushEvent' && event.payload.commits && event.payload.commits.length > 0) {
                    // Escape message to prevent XSS
                    const escapedMessage = event.payload.commits[0].message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    commitMsg = `<div class="gh-commit">${escapedMessage}</div>`;
                }

                item.innerHTML = `
                    <div class="gh-header">
                        <span class="gh-type">${typeLabel}</span>
                        <a href="https://github.com/${repoName}" target="_blank" rel="noreferrer" class="gh-repo">${repoName}</a>
                        <span class="gh-time">${date}</span>
                    </div>
                    ${commitMsg}
                `;
                container.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error fetching GitHub events:', error);
            container.innerHTML = '<div class="gh-placeholder">Could not load GitHub activity.</div>';
        });
}

// Contact time loop
function updateTimes() {
    const localEl = document.getElementById('contact-local-time');
    const ptEl = document.getElementById('contact-pt-time');

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
    updateTimes();
    window.setInterval(updateTimes, 30_000);
}

window.addEventListener('DOMContentLoaded', () => {
    initMusicWidget();
    initBackgroundToggle();
    renderBlogFromData();
    initMycoCarousel();
    initGitHubFeed();
    initContactTimes();

    const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    navLinks.forEach((link) => {
        const targetId = link.getAttribute('href')?.slice(1);
        if (!targetId) return;
        const targetIndex = slides.findIndex((s) => s.id === targetId);
        if (targetIndex === -1) return;
        link.addEventListener('click', (e) => {
            document.body.classList.remove('bg-viewing');
            if (window.innerWidth <= 768) return;
            e.preventDefault();
            if (!isSliding) goToSlide(targetIndex);
        });
    });

    const slideLinks = Array.from(document.querySelectorAll('.slides-viewport a[href^="#"]'));
    slideLinks.forEach((link) => {
        const targetId = link.getAttribute('href')?.slice(1);
        if (!targetId) return;
        const targetIndex = slides.findIndex((s) => s.id === targetId);
        if (targetIndex === -1) return;

        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) return;
            e.preventDefault();
            if (!isSliding) goToSlide(targetIndex);
        });
    });

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

// Basic volcano + scroll interaction and music widget wiring

const volcanoSmoke = document.getElementById('volcano-smoke');
const lavaParticlesContainer = document.getElementById('lava-particles');
const musicToggle = document.getElementById('music-toggle');
const musicPlayer = document.getElementById('music-player');
const bgToggle = document.getElementById('bg-toggle');
const slidesTrack = document.querySelector('.slides-track');
const slides = slidesTrack
    ? Array.from(slidesTrack.querySelectorAll('.slide:not([data-hidden="true"])'))
    : [];

let currentSlideIndex = 0;
let isSliding = false;
const SLIDE_DURATION_MS = 550;

const PARTICLE_COUNT = 36;
const particles = [];

function createParticles() {
    if (!lavaParticlesContainer) return;
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const el = document.createElement('div');
        el.className = 'lava-particle';
        lavaParticlesContainer.appendChild(el);
        particles.push({
            el,
            baseX: 45 + Math.random() * 10,
            baseY: 50 + Math.random() * 10,
            ampX: 3 + Math.random() * 6,
            ampY: 15 + Math.random() * 20,
            speed: 0.15 + Math.random() * 0.25,
            phase: Math.random() * Math.PI * 2,
        });
    }
}

function updateParticles(scrollFactor, t) {
    const intensity = 0.3 + scrollFactor * 0.7;
    particles.forEach((p, index) => {
        const localPhase = p.phase + t * p.speed + index * 0.1;
        const x = p.baseX + Math.sin(localPhase) * p.ampX * intensity;
        const y = p.baseY - Math.cos(localPhase) * p.ampY * intensity;
        const scale = 0.6 + intensity * 0.9;
        const opacity = 0.1 + intensity * 0.6;
        p.el.style.transform = `translate(-50%, -50%) translate(${x}%, ${y}%) scale(${scale})`;
        p.el.style.opacity = String(opacity);
    });
}

function updateSmoke(scrollFactor, t) {
    if (!volcanoSmoke) return;
    const float = Math.sin(t * 0.12) * 4;
    const widen = 1 + scrollFactor * 0.4;
    const opacity = 0.45 + scrollFactor * 0.4;
    volcanoSmoke.style.transform = `translateX(-50%) translateY(${float}px) scale(${widen})`;
    volcanoSmoke.style.opacity = String(opacity);
}

// Scroll factor from 0–1 based on main content
function getScrollFactor() {
    const totalSlides = slides.length || 1;
    if (totalSlides <= 1) return 0;
    return currentSlideIndex / (totalSlides - 1);
}

let lastTime = performance.now();

function frame(now) {
    const dt = (now - lastTime) / 1000;
    const t = now / 1000;
    lastTime = now;

    const scrollFactor = getScrollFactor();
    updateParticles(scrollFactor, t);
    updateSmoke(scrollFactor, t);

    window.requestAnimationFrame(frame);
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

// Local music widget
let localAudioPlayer;

function initMusicWidget() {
    localAudioPlayer = new Audio();
    localAudioPlayer.volume = 0.25;

    const volumeSlider = document.getElementById('music-volume');
    const skipBtn = document.getElementById('music-skip');
    const titleEl = document.querySelector('.music-title');

    function loadRandomSong(autoPlay = false) {
        if (!window.LOCAL_SONGS || window.LOCAL_SONGS.length === 0) {
            console.warn("[Widget] No local songs available in window.LOCAL_SONGS.");
            if (titleEl) titleEl.textContent = 'No songs found';
            return;
        }

        const randomIndex = Math.floor(Math.random() * window.LOCAL_SONGS.length);
        const filename = window.LOCAL_SONGS[randomIndex];
        playSpecificSong(filename, autoPlay);
    }

    function playSpecificSong(filename, autoPlay = true) {
        localAudioPlayer.src = 'assets/songs/' + filename;
        if (titleEl) titleEl.textContent = filename.replace(/\.[^/.]+$/, "");

        if (autoPlay) {
            localAudioPlayer.play().then(() => {
                if (musicToggle) {
                    musicToggle.dataset.state = 'playing';
                    musicToggle.textContent = 'Pause';
                }
            }).catch(err => {
                console.warn("[Widget] Autoplay blocked by browser. Awaiting interaction.");
                if (musicToggle) {
                    musicToggle.dataset.state = 'paused';
                    musicToggle.textContent = 'Play';
                }
            });
        }
    }

    setTimeout(() => {
        loadRandomSong(true);
    }, 200);

    function playRandomSong() {
        loadRandomSong(true);
    }

    if (volumeSlider) {
        let savedVol = parseInt(volumeSlider.value, 10);
        if (!isNaN(savedVol)) {
            localAudioPlayer.volume = savedVol / 100;
        }
        volumeSlider.addEventListener('input', (e) => {
            localAudioPlayer.volume = parseInt(e.target.value, 10) / 100;
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', () => playRandomSong());
    }

    localAudioPlayer.addEventListener('ended', () => playRandomSong());

    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            const isPaused = musicToggle.dataset.state !== 'playing';

            if (isPaused) {
                if (!localAudioPlayer.src || !localAudioPlayer.src.includes('assets/songs')) {
                    playRandomSong();
                } else {
                    localAudioPlayer.play().then(() => {
                        musicToggle.dataset.state = 'playing';
                        musicToggle.textContent = 'Pause';
                    });
                }
            } else {
                localAudioPlayer.pause();
                musicToggle.dataset.state = 'paused';
                musicToggle.textContent = 'Play';
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
    createParticles();
    initMusicWidget();
    initBackgroundToggle();
    renderBlogFromData();
    initMycoCarousel();
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
    if (window.innerWidth > 768) goToSlide(0);
    window.requestAnimationFrame(frame);
});

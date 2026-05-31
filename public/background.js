document.addEventListener('DOMContentLoaded', () => {
    const celestialBody = document.querySelector('.celestial-body');
    const sunGlow       = document.querySelector('.sun-glow');
    const videoBg       = document.querySelector('.video-bg');
    const cityscape     = document.querySelector('.cityscape');
    const weatherEffects = document.querySelector('.weather-effects');
    const starsEl       = document.querySelector('.stars');

    const sunColor  = getComputedStyle(document.documentElement).getPropertyValue('--sun-color').trim();
    const moonColor = getComputedStyle(document.documentElement).getPropertyValue('--moon-color').trim();
    const skyDay    = getComputedStyle(document.documentElement).getPropertyValue('--sky-day').trim();
    const skyNight  = getComputedStyle(document.documentElement).getPropertyValue('--sky-night').trim();

    // ── Stars ──────────────────────────────────────────────
    function initStars() {
        if (!starsEl) return;
        const shadows = [];
        for (let i = 0; i < 220; i++) {
            const x = Math.floor(Math.random() * 100);
            const y = Math.floor(Math.random() * 60);
            const tints = ['#fff8f4', '#ffe8d0', '#ffd0b0', '#f8e0e0', '#fffaf6'];
            const color = tints[Math.floor(Math.random() * tints.length)];
            const size  = Math.random() < 0.12 ? '2px' : '1px';
            shadows.push(`${x}vw ${y}vh 0 ${size} ${color}`);
        }
        starsEl.style.boxShadow = shadows.join(', ');
    }
    initStars();

    // ── Cityscape building gradient ────────────────────────
    // Directional lighting: gradient runs left→right across the SVG (userSpaceOnUse, 0–1000).
    // Sun on the left → lit side is left (s1 lighter), shadow on right (s2 darker).
    // Sun on the right → reversed.
    function updateCityscapeLighting(state, xPos) {
        const grad = document.getElementById('bldg-fill');
        const s1   = document.getElementById('bldg-s1');
        const s2   = document.getElementById('bldg-s2');
        if (!grad || !s1 || !s2) return;

        // xPos is 0–100 (% of screen width, i.e. sun's horizontal position)
        // Map to SVG coordinate space (0–1000)
        const fromLeft = xPos < 50;
        const gx1 = fromLeft ? '0'    : '1000';
        const gx2 = fromLeft ? '1000' : '0';

        if (state === 'night') {
            // Uniform near-black — no directional light
            grad.setAttribute('x1', '0');
            grad.setAttribute('x2', '1');
            s1.setAttribute('stop-color', '#0c1018');
            s2.setAttribute('stop-color', '#0d1120');
        } else if (state === 'day') {
            // Sun-facing side: slate blue-grey; shadow side: deeper charcoal
            grad.setAttribute('x1', gx1);
            grad.setAttribute('x2', gx2);
            s1.setAttribute('stop-color', '#2e3c4e');  // lit face
            s2.setAttribute('stop-color', '#18222e');  // shadow face
        } else {
            // Sunrise or sunset: warm orange/amber rim on sun side
            grad.setAttribute('x1', gx1);
            grad.setAttribute('x2', gx2);
            s1.setAttribute('stop-color', '#5c3020');  // warm rim
            s2.setAttribute('stop-color', '#16100c');  // deep shadow
        }
    }

    // ── Time of day ────────────────────────────────────────
    // Called every 10 seconds. CSS transitions (2–3 s) bridge the gaps so
    // the sky, sun arc, and cityscape all shift continuously rather than snapping.
    //
    // Window lights use body state classes (is-day / is-night / is-sunset).
    // The CSS `transition: fill 3s ease` on .win means the amber glow fades in/out
    // smoothly as the class changes at the dawn/dusk thresholds.
    function updateTimeOfDay() {
        const now          = new Date();
        const hours        = now.getHours();
        const minutes      = now.getMinutes();
        const totalMinutes = hours * 60 + minutes;

        // Sunrise 5:00–7:00 | Day 7:00–17:00 | Sunset 17:00–19:00 | Night: else
        let state = 'night';
        if      (totalMinutes >= 300  && totalMinutes < 420)  state = 'sunrise';
        else if (totalMinutes >= 420  && totalMinutes < 1020) state = 'day';
        else if (totalMinutes >= 1020 && totalMinutes < 1140) state = 'sunset';

        // Map sunrise → is-day so clouds/windows use the right CSS state.
        // Sunset gets its own is-sunset class so windows dim to ember before night.
        const bodyClass = state === 'sunrise' ? 'is-day' : `is-${state}`;
        document.body.classList.remove('is-day', 'is-night', 'is-sunset');
        document.body.classList.add(bodyClass);

        // ── Celestial body appearance ─────────────────────
        let progress;
        if (state === 'day' || state === 'sunrise' || state === 'sunset') {
            celestialBody.style.background  = sunColor;
            celestialBody.style.boxShadow   =
                `0 0 0 2px rgba(220,180,50,0.5), 0 0 18px 4px ${sunColor}`;

            if (state === 'sunset' || state === 'sunrise') {
                videoBg.style.backgroundColor = '#1e0e06';
                sunGlow.style.opacity = '1';
            } else {
                videoBg.style.backgroundColor = skyDay;
                sunGlow.style.opacity = '0';
            }

            // progress: 0 at 5:00 AM, 1 at 7:00 PM (300 → 1140 min)
            progress = (totalMinutes - 300) / (1140 - 300);
        } else {
            celestialBody.style.background = moonColor;
            celestialBody.style.boxShadow  =
                `0 0 0 2px rgba(200,180,130,0.50), 0 0 0 5px rgba(200,180,130,0.12),
                 0 0 18px 4px rgba(200,180,130,0.25)`;
            videoBg.style.backgroundColor = skyNight;
            sunGlow.style.opacity = '0';

            // progress: moon arcs from 7 PM to 5 AM (1140 → 300+1440 min)
            if (hours >= 19) {
                progress = (totalMinutes - 1140) / 600;
            } else {
                progress = (totalMinutes + 300) / 600;
            }
        }

        const p    = Math.max(0, Math.min(1, progress));
        const xPos = p * 100;                              // 0–100 %
        const yPos = 100 - (Math.sin(p * Math.PI) * 80);  // arc peak at midday

        celestialBody.style.left = `${xPos}%`;
        celestialBody.style.top  = `${yPos}%`;
        sunGlow.style.left = `${xPos}%`;
        sunGlow.style.top  = `${yPos}%`;

        // Update building gradient for directional sun lighting
        updateCityscapeLighting(state, xPos);
    }

    updateTimeOfDay();
    // 10-second polling: CSS transitions (2–3 s each) bridge the gap smoothly
    setInterval(updateTimeOfDay, 10000);

    // ── Weather ────────────────────────────────────────────
    let raindropsCreated = false;

    function initRaindrops() {
        if (raindropsCreated) return;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 40; i++) {
            const drop = document.createElement('div');
            drop.classList.add('rain');
            drop.style.left              = `${Math.random() * 100}%`;
            drop.style.animationDelay    = `-${Math.random() * 1}s`;
            drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            fragment.appendChild(drop);
        }
        weatherEffects.appendChild(fragment);
        raindropsCreated = true;
    }

    function startStorm() {
        initRaindrops();
        document.body.classList.add('stormy');
        weatherEffects.style.display = 'block';
    }

    function stopStorm() {
        document.body.classList.remove('stormy');
        weatherEffects.style.display = 'none';
    }

    function randomWeatherToggle() {
        if (Math.random() < 0.2 && !document.body.classList.contains('stormy')) {
            startStorm();
            setTimeout(stopStorm, 10000 + Math.random() * 20000);
        }
    }

    setInterval(randomWeatherToggle, 30000);
});

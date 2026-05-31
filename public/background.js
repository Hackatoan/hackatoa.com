document.addEventListener('DOMContentLoaded', () => {
    const celestialBody = document.querySelector('.celestial-body');
    const sunGlow        = document.querySelector('.sun-glow');
    const videoBg        = document.querySelector('.video-bg');
    const weatherEffects = document.querySelector('.weather-effects');
    const starsEl        = document.querySelector('.stars');

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

    // ── Scene-time override ────────────────────────────────
    // null  = use real wall-clock time
    // number = totalMinutes override set by the scene clock slider
    let bgTimeOverride = null;

    // ── Cityscape building gradient ────────────────────────
    function updateCityscapeLighting(state, xPos) {
        const grad = document.getElementById('bldg-fill');
        const s1   = document.getElementById('bldg-s1');
        const s2   = document.getElementById('bldg-s2');
        if (!grad || !s1 || !s2) return;

        const fromLeft = xPos < 50;
        const gx1 = fromLeft ? '0'    : '1000';
        const gx2 = fromLeft ? '1000' : '0';

        if (state === 'night') {
            grad.setAttribute('x1', '0');
            grad.setAttribute('x2', '1');
            s1.setAttribute('stop-color', '#0c1018');
            s2.setAttribute('stop-color', '#0d1120');
        } else if (state === 'day') {
            grad.setAttribute('x1', gx1);
            grad.setAttribute('x2', gx2);
            s1.setAttribute('stop-color', '#2e3c4e');
            s2.setAttribute('stop-color', '#18222e');
        } else {
            // sunrise / sunset — warm orange rim on sun side
            grad.setAttribute('x1', gx1);
            grad.setAttribute('x2', gx2);
            s1.setAttribute('stop-color', '#5c3020');
            s2.setAttribute('stop-color', '#16100c');
        }
    }

    // ── Scene clock display ────────────────────────────────
    function updateSceneClockDisplay(totalMinutes, state) {
        const timeEl  = document.getElementById('scene-time-display');
        const phaseEl = document.getElementById('scene-phase-display');
        if (!timeEl) return;

        const h  = Math.floor(totalMinutes / 60) % 24;
        const m  = totalMinutes % 60;
        const ampm = h < 12 ? 'AM' : 'PM';
        const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
        timeEl.textContent = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;

        if (phaseEl) {
            const phases = {
                sunrise: 'Sunrise',
                day:     'Daytime',
                sunset:  'Sunset',
                night:   'Night'
            };
            phaseEl.textContent = phases[state] || '';
        }

        // Show/hide the ↺ Live reset button depending on override state
        const resetBtn = document.getElementById('scene-time-reset');
        if (resetBtn) {
            resetBtn.classList.toggle('hidden', bgTimeOverride === null);
        }
    }

    // ── Time of day (core) ─────────────────────────────────
    // Called every 10 seconds. CSS transitions (2–3 s each) bridge the gaps.
    // When bgTimeOverride is set (slider drag), the override totalMinutes is used
    // instead of the real clock — letting the user scrub through the day cycle.
    function updateTimeOfDay() {
        let totalMinutes, hours;

        if (bgTimeOverride !== null) {
            totalMinutes = bgTimeOverride;
            hours        = Math.floor(totalMinutes / 60) % 24;
        } else {
            const now    = new Date();
            hours        = now.getHours();
            totalMinutes = hours * 60 + now.getMinutes();
            // Keep slider in sync with real time when not overriding
            const slider = document.getElementById('scene-time-slider');
            if (slider) slider.value = totalMinutes;
        }

        // Sunrise 5:00–7:00 | Day 7:00–17:00 | Sunset 17:00–19:00 | Night: else
        let state = 'night';
        if      (totalMinutes >= 300  && totalMinutes < 420)  state = 'sunrise';
        else if (totalMinutes >= 420  && totalMinutes < 1020) state = 'day';
        else if (totalMinutes >= 1020 && totalMinutes < 1140) state = 'sunset';

        // sunrise uses the same CSS class as day (clouds / windows)
        const bodyClass = state === 'sunrise' ? 'is-day' : `is-${state}`;
        document.body.classList.remove('is-day', 'is-night', 'is-sunset');
        document.body.classList.add(bodyClass);

        // ── Celestial body ────────────────────────────────
        let progress;
        if (state === 'day' || state === 'sunrise' || state === 'sunset') {
            celestialBody.style.background = sunColor;
            celestialBody.style.boxShadow  =
                `0 0 0 2px rgba(220,180,50,0.5), 0 0 18px 4px ${sunColor}`;

            if (state === 'sunset' || state === 'sunrise') {
                videoBg.style.backgroundColor = '#1e0e06';
                sunGlow.style.opacity = '1';
            } else {
                videoBg.style.backgroundColor = skyDay;
                sunGlow.style.opacity = '0';
            }

            // progress: 0 at 5:00 AM → 1 at 7:00 PM (300 → 1140 min)
            progress = (totalMinutes - 300) / (1140 - 300);
        } else {
            celestialBody.style.background = moonColor;
            celestialBody.style.boxShadow  =
                `0 0 0 2px rgba(200,180,130,0.50), 0 0 0 5px rgba(200,180,130,0.12),
                 0 0 18px 4px rgba(200,180,130,0.25)`;
            videoBg.style.backgroundColor = skyNight;
            sunGlow.style.opacity = '0';

            if (hours >= 19) {
                progress = (totalMinutes - 1140) / 600;
            } else {
                progress = (totalMinutes + 300) / 600;
            }
        }

        const p    = Math.max(0, Math.min(1, progress));
        const xPos = p * 100;
        const yPos = 100 - (Math.sin(p * Math.PI) * 80);

        celestialBody.style.left = `${xPos}%`;
        celestialBody.style.top  = `${yPos}%`;
        sunGlow.style.left = `${xPos}%`;
        sunGlow.style.top  = `${yPos}%`;

        updateCityscapeLighting(state, xPos);
        updateSceneClockDisplay(totalMinutes, state);
    }

    // ── Scene clock widget wiring ──────────────────────────
    function initSceneClock() {
        const slider   = document.getElementById('scene-time-slider');
        const resetBtn = document.getElementById('scene-time-reset');
        if (!slider) return;

        // Seed slider to current real time on init
        const now = new Date();
        slider.value = now.getHours() * 60 + now.getMinutes();

        slider.addEventListener('input', () => {
            bgTimeOverride = parseInt(slider.value, 10);
            updateTimeOfDay();
        });

        // Releasing the slider keeps the override in place until ↺ Live is clicked
        // (so you can set it to e.g. "night" and leave it there to watch the stars)

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                bgTimeOverride = null;
                const now = new Date();
                slider.value = now.getHours() * 60 + now.getMinutes();
                updateTimeOfDay();
            });
        }
    }

    initSceneClock();
    updateTimeOfDay();
    // 10-second polling — CSS transitions (2–3 s) bridge the gap for continuous feel
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

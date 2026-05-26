document.addEventListener('DOMContentLoaded', () => {
    const celestialBody = document.querySelector('.celestial-body');
    const sunGlow = document.querySelector('.sun-glow');
    const videoBg = document.querySelector('.video-bg');
    const ocean = document.querySelector('.ocean');
    const weatherEffects = document.querySelector('.weather-effects');
    const starsEl = document.querySelector('.stars');

    const sunColor = getComputedStyle(document.documentElement).getPropertyValue('--sun-color').trim();
    const moonColor = getComputedStyle(document.documentElement).getPropertyValue('--moon-color').trim();
    const skyDay = getComputedStyle(document.documentElement).getPropertyValue('--sky-day').trim();
    const skyNight = getComputedStyle(document.documentElement).getPropertyValue('--sky-night').trim();
    const oceanDay = getComputedStyle(document.documentElement).getPropertyValue('--ocean-day').trim();
    const oceanNight = getComputedStyle(document.documentElement).getPropertyValue('--ocean-night').trim();

    // ── Stars ──────────────────────────────────────────────
    function initStars() {
        if (!starsEl) return;
        const shadows = [];
        for (let i = 0; i < 220; i++) {
            const x = Math.floor(Math.random() * 100);
            const y = Math.floor(Math.random() * 60);
            const tints = ['#fff8f4', '#ffe8d0', '#ffd0b0', '#f8e0e0', '#fffaf6'];
            const color = tints[Math.floor(Math.random() * tints.length)];
            const size = Math.random() < 0.12 ? '2px' : '1px';
            shadows.push(`${x}vw ${y}vh 0 ${size} ${color}`);
        }
        starsEl.style.boxShadow = shadows.join(', ');
    }
    initStars();

    // ── Time of day ────────────────────────────────────────
    function updateTimeOfDay() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const totalMinutes = hours * 60 + minutes;

        // Sunrise: 5:00-7:00  Day: 7:00-17:00  Sunset: 17:00-19:00  Night: else
        let state = 'night';
        if (totalMinutes >= 300 && totalMinutes < 420) state = 'sunrise';
        else if (totalMinutes >= 420 && totalMinutes < 1020) state = 'day';
        else if (totalMinutes >= 1020 && totalMinutes < 1140) state = 'sunset';

        document.body.classList.remove('is-day', 'is-night', 'is-sunset');
        document.body.classList.add(`is-${state === 'sunrise' ? 'day' : state}`);

        let progress;
        if (state === 'day' || state === 'sunrise' || state === 'sunset') {
            celestialBody.style.background = sunColor;
            celestialBody.style.boxShadow = `0 0 0 2px rgba(220,180,50,0.5), 0 0 18px 4px ${sunColor}`;

            if (state === 'sunset' || state === 'sunrise') {
                videoBg.style.backgroundColor = '#1e0e06';
                ocean.style.backgroundColor = '#0c1820';
                sunGlow.style.opacity = '1';
            } else {
                videoBg.style.backgroundColor = skyDay;
                ocean.style.backgroundColor = oceanDay;
                sunGlow.style.opacity = '0';
            }

            progress = (totalMinutes - 300) / (1140 - 300);
        } else {
            celestialBody.style.background = moonColor;
            celestialBody.style.boxShadow = `0 0 0 2px rgba(200,180,130,0.50), 0 0 0 5px rgba(200,180,130,0.12), 0 0 18px 4px rgba(200,180,130,0.25)`;
            videoBg.style.backgroundColor = skyNight;
            ocean.style.backgroundColor = oceanNight;
            sunGlow.style.opacity = '0';

            if (hours >= 19) {
                progress = (totalMinutes - 1140) / 600;
            } else {
                progress = (totalMinutes + 300) / 600;
            }
        }

        const p = Math.max(0, Math.min(1, progress));
        const xPos = p * 100;
        const yPos = 100 - (Math.sin(p * Math.PI) * 80);

        celestialBody.style.left = `${xPos}%`;
        celestialBody.style.top = `${yPos}%`;
        sunGlow.style.left = `${xPos}%`;
        sunGlow.style.top = `${yPos}%`;
    }

    updateTimeOfDay();
    setInterval(updateTimeOfDay, 60000);

    // ── Weather ────────────────────────────────────────────
    let raindropsCreated = false;

    function initRaindrops() {
        if (raindropsCreated) return;
        // ⚡ Bolt Optimization: Pre-create DOM elements for rain to prevent layout thrashing
        // from repeated createElement/removeChild calls inside a tight setInterval loop.
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 40; i++) {
            const drop = document.createElement('div');
            drop.classList.add('rain');
            drop.style.left = `${Math.random() * 100}%`;
            // Distribute animation delays so they don't all fall at once
            drop.style.animationDelay = `-${Math.random() * 1}s`;
            drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            fragment.appendChild(drop);
        }
        weatherEffects.appendChild(fragment);
        raindropsCreated = true;
    }

    function startStorm() {
        initRaindrops();
        document.body.classList.add('stormy');
        // Setting display to block/flex or relying on .stormy class via CSS
        weatherEffects.style.display = 'block';
    }

    function stopStorm() {
        document.body.classList.remove('stormy');
        // Hide raindrops instead of deleting them to save CPU cycles
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

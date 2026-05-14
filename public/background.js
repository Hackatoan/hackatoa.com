document.addEventListener('DOMContentLoaded', () => {
    const celestialBody = document.querySelector('.celestial-body');
    const sunGlow = document.querySelector('.sun-glow');
    const videoBg = document.querySelector('.video-bg');
    const ocean = document.querySelector('.ocean');
    const weatherEffects = document.querySelector('.weather-effects');
    const starsEl = document.querySelector('.stars');
    const volcanoEl = document.querySelector('.volcano');

    const sunColor = getComputedStyle(document.documentElement).getPropertyValue('--sun-color').trim();
    const moonColor = getComputedStyle(document.documentElement).getPropertyValue('--moon-color').trim();
    const skyDay = getComputedStyle(document.documentElement).getPropertyValue('--sky-day').trim();
    const skyNight = getComputedStyle(document.documentElement).getPropertyValue('--sky-night').trim();
    const skySunsetTop = getComputedStyle(document.documentElement).getPropertyValue('--sky-sunset-top').trim();
    const skySunsetBottom = getComputedStyle(document.documentElement).getPropertyValue('--sky-sunset-bottom').trim();
    const oceanDay = getComputedStyle(document.documentElement).getPropertyValue('--ocean-day').trim();
    const oceanNight = getComputedStyle(document.documentElement).getPropertyValue('--ocean-night').trim();

    // ── Stars ──────────────────────────────────────────────
    function initStars() {
        if (!starsEl) return;
        const shadows = [];
        for (let i = 0; i < 220; i++) {
            const x = Math.floor(Math.random() * 100);
            const y = Math.floor(Math.random() * 60);
            // Warm tint: most white, some amber, a few rosy
            const tints = ['#fff8f4', '#ffe8d0', '#ffd0b0', '#f8e0e0', '#fffaf6'];
            const color = tints[Math.floor(Math.random() * tints.length)];
            const size = Math.random() < 0.12 ? '2px' : '1px';
            shadows.push(`${x}vw ${y}vh 0 ${size} ${color}`);
        }
        starsEl.style.boxShadow = shadows.join(', ');
    }
    initStars();

    // ── Lava sparks ────────────────────────────────────────
    function createLavaSpark() {
        if (!volcanoEl) return;
        const spark = document.createElement('div');
        spark.classList.add('lava-spark');
        // Random scatter from crater top: -60 to +60 px X, -20 to -120 px Y
        spark.style.setProperty('--sx', `${(Math.random() * 120 - 60).toFixed(1)}px`);
        spark.style.setProperty('--sy', `${-(20 + Math.random() * 100).toFixed(1)}px`);
        spark.style.setProperty('--spark-dur', `${(0.6 + Math.random() * 0.8).toFixed(2)}s`);
        // Horizontal start near crater center
        spark.style.left = `calc(50% + ${(Math.random() * 16 - 8).toFixed(1)}px)`;
        spark.style.top = '0px';

        const container = volcanoEl.querySelector('.lava-sparks') || volcanoEl;
        container.appendChild(spark);

        const dur = parseFloat(spark.style.getPropertyValue('--spark-dur')) * 1000 + 100;
        setTimeout(() => {
            if (spark.parentNode) spark.parentNode.removeChild(spark);
        }, dur);
    }

    // Sparks every 120–350 ms
    function scheduleSpark() {
        createLavaSpark();
        setTimeout(scheduleSpark, 120 + Math.random() * 230);
    }
    scheduleSpark();

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
            celestialBody.style.boxShadow = `0 0 50px ${sunColor}`;

            if (state === 'sunset' || state === 'sunrise') {
                videoBg.style.background = [
                    'radial-gradient(ellipse at 50% 105%, rgba(200, 50, 12, 0.28) 0%, transparent 45%)',
                    `linear-gradient(to bottom, ${skySunsetTop} 0%, ${skySunsetBottom} 100%)`
                ].join(', ');
                ocean.style.background = `linear-gradient(to bottom, #1a4a5e, #050e14)`;
                sunGlow.style.opacity = '1';
            } else {
                videoBg.style.background = [
                    'radial-gradient(ellipse at 50% 105%, rgba(200, 50, 12, 0.12) 0%, transparent 45%)',
                    `linear-gradient(to bottom, ${skyDay} 0%, #6ab4d8 100%)`
                ].join(', ');
                ocean.style.background = `linear-gradient(to bottom, ${oceanDay}, #0d5080)`;
                sunGlow.style.opacity = '0';
            }

            progress = (totalMinutes - 300) / (1140 - 300);
        } else {
            celestialBody.style.background = moonColor;
            celestialBody.style.boxShadow = `0 0 40px ${moonColor}`;
            videoBg.style.background = [
                'radial-gradient(ellipse at 50% 105%, rgba(200, 50, 12, 0.22) 0%, transparent 45%)',
                `linear-gradient(to bottom, ${skyNight} 0%, #0c0604 100%)`
            ].join(', ');
            ocean.style.background = `linear-gradient(to bottom, ${oceanNight}, #04080c)`;
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
    let rainInterval;

    function createRaindrop() {
        const drop = document.createElement('div');
        drop.classList.add('rain');
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.top = `-20px`;
        drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        weatherEffects.appendChild(drop);

        setTimeout(() => {
            if (weatherEffects.contains(drop)) weatherEffects.removeChild(drop);
        }, 1000);
    }

    function startStorm() {
        document.body.classList.add('stormy');
        rainInterval = setInterval(createRaindrop, 50);
    }

    function stopStorm() {
        document.body.classList.remove('stormy');
        clearInterval(rainInterval);
        weatherEffects.innerHTML = '';
    }

    function randomWeatherToggle() {
        if (Math.random() < 0.2 && !document.body.classList.contains('stormy')) {
            startStorm();
            setTimeout(stopStorm, 10000 + Math.random() * 20000);
        }
    }

    setInterval(randomWeatherToggle, 30000);
});

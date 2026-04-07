document.addEventListener('DOMContentLoaded', () => {
    const celestialBody = document.querySelector('.celestial-body');
    const sunGlow = document.querySelector('.sun-glow');
    const videoBg = document.querySelector('.video-bg');
    const ocean = document.querySelector('.ocean');
    const weatherEffects = document.querySelector('.weather-effects');

    const sunColor = getComputedStyle(document.documentElement).getPropertyValue('--sun-color').trim();
    const moonColor = getComputedStyle(document.documentElement).getPropertyValue('--moon-color').trim();
    const skyDay = getComputedStyle(document.documentElement).getPropertyValue('--sky-day').trim();
    const skyNight = getComputedStyle(document.documentElement).getPropertyValue('--sky-night').trim();
    const skySunsetTop = getComputedStyle(document.documentElement).getPropertyValue('--sky-sunset-top').trim();
    const skySunsetBottom = getComputedStyle(document.documentElement).getPropertyValue('--sky-sunset-bottom').trim();
    const oceanDay = getComputedStyle(document.documentElement).getPropertyValue('--ocean-day').trim();
    const oceanNight = getComputedStyle(document.documentElement).getPropertyValue('--ocean-night').trim();

    function updateTimeOfDay() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const totalMinutes = hours * 60 + minutes;

        // Transitions:
        // Sunrise: 5:00 - 7:00 (300 - 420 mins)
        // Day: 7:00 - 17:00 (420 - 1020 mins)
        // Sunset: 17:00 - 19:00 (1020 - 1140 mins)
        // Night: 19:00 - 5:00

        let state = 'night';
        if (totalMinutes >= 300 && totalMinutes < 420) state = 'sunrise';
        else if (totalMinutes >= 420 && totalMinutes < 1020) state = 'day';
        else if (totalMinutes >= 1020 && totalMinutes < 1140) state = 'sunset';

        // Update classes for CSS
        document.body.classList.remove('is-day', 'is-night', 'is-sunset');
        if (state === 'day' || state === 'sunrise') document.body.classList.add('is-day');
        if (state === 'night') document.body.classList.add('is-night');
        if (state === 'sunset') document.body.classList.add('is-sunset');

        if (state === 'day' || state === 'sunrise' || state === 'sunset') {
            celestialBody.style.background = sunColor;
            celestialBody.style.boxShadow = `0 0 50px ${sunColor}`;

            if (state === 'sunset' || state === 'sunrise') {
                videoBg.style.background = `linear-gradient(to bottom, ${skySunsetTop} 0%, ${skySunsetBottom} 100%)`;
                ocean.style.background = `linear-gradient(to bottom, #005f73, #020309)`;
                sunGlow.style.opacity = '1';
            } else {
                videoBg.style.background = skyDay;
                ocean.style.background = `linear-gradient(to bottom, ${oceanDay}, #106ea1)`;
                sunGlow.style.opacity = '0';
            }

            // Map 5AM (300 mins) to 0% (left) and 7PM (1140 mins) to 100% (right)
            const progress = (totalMinutes - 300) / (1140 - 300);
            // Cap progress to prevent weirdness at edges if exactly matching
            const p = Math.max(0, Math.min(1, progress));
            const xPos = p * 100;
            // Parabola for height: peak in middle
            const yPos = 100 - (Math.sin(p * Math.PI) * 80);

            celestialBody.style.left = `${xPos}%`;
            celestialBody.style.top = `${yPos}%`;
            sunGlow.style.left = `${xPos}%`;
            sunGlow.style.top = `${yPos}%`;

        } else {
            celestialBody.style.background = moonColor;
            celestialBody.style.boxShadow = `0 0 40px ${moonColor}`;
            videoBg.style.background = `linear-gradient(to bottom, ${skyNight} 0%, ${skyNight} 100%)`;
            ocean.style.background = `linear-gradient(to bottom, ${oceanNight}, #020309)`;
            sunGlow.style.opacity = '0';

            // Map 7PM (1140 mins) to 0% (left) and 5AM (next day) to 100% (right)
            let progress;
            if (hours >= 19) {
                progress = (totalMinutes - 1140) / 600;
            } else {
                progress = (totalMinutes + 300) / 600;
            }
            const p = Math.max(0, Math.min(1, progress));
            const xPos = p * 100;
            const yPos = 100 - (Math.sin(p * Math.PI) * 80);

            celestialBody.style.left = `${xPos}%`;
            celestialBody.style.top = `${yPos}%`;
            sunGlow.style.left = `${xPos}%`;
            sunGlow.style.top = `${yPos}%`;
        }
    }

    // Initialize and update every minute
    updateTimeOfDay();
    setInterval(updateTimeOfDay, 60000);

    // Weather states logic
    let rainInterval;

    function createRaindrop() {
        const drop = document.createElement('div');
        drop.classList.add('rain');
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.top = `-20px`;
        drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        weatherEffects.appendChild(drop);

        // Remove drop after animation
        setTimeout(() => {
            if (weatherEffects.contains(drop)) {
                weatherEffects.removeChild(drop);
            }
        }, 1000);
    }

    function startStorm() {
        document.body.classList.add('stormy');
        rainInterval = setInterval(createRaindrop, 50);
    }

    function stopStorm() {
        document.body.classList.remove('stormy');
        clearInterval(rainInterval);
        weatherEffects.innerHTML = ''; // Clear all rain
    }

    function randomWeatherToggle() {
        // 20% chance of storm every time this is checked
        if (Math.random() < 0.2) {
            if (!document.body.classList.contains('stormy')) {
                startStorm();
                // Storm lasts for 10-30 seconds for demo purposes
                setTimeout(stopStorm, 10000 + Math.random() * 20000);
            }
        }
    }

    // Check for random weather changes every 30 seconds
    setInterval(randomWeatherToggle, 30000);
});
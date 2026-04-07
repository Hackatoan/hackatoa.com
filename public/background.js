document.addEventListener('DOMContentLoaded', () => {
    const celestialBody = document.querySelector('.celestial-body');
    const videoBg = document.querySelector('.video-bg');
    const ocean = document.querySelector('.ocean');
    const clouds = document.querySelectorAll('.cloud');
    const weatherEffects = document.querySelector('.weather-effects');

    const sunColor = getComputedStyle(document.documentElement).getPropertyValue('--sun-color').trim();
    const moonColor = getComputedStyle(document.documentElement).getPropertyValue('--moon-color').trim();
    const skyDay = getComputedStyle(document.documentElement).getPropertyValue('--sky-day').trim();
    const skyNight = getComputedStyle(document.documentElement).getPropertyValue('--sky-night').trim();
    const oceanDay = getComputedStyle(document.documentElement).getPropertyValue('--ocean-day').trim();
    const oceanNight = getComputedStyle(document.documentElement).getPropertyValue('--ocean-night').trim();
    const cloudDay = getComputedStyle(document.documentElement).getPropertyValue('--cloud-day').trim();


    function updateTimeOfDay() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const totalMinutes = hours * 60 + minutes;

        // Calculate position based on time. 6 AM to 6 PM is day
        const isDay = hours >= 6 && hours < 18;

        if (isDay) {
            celestialBody.style.background = sunColor;
            celestialBody.style.boxShadow = `0 0 50px ${sunColor}`;
            videoBg.style.backgroundColor = skyDay;
            ocean.style.background = `linear-gradient(to bottom, ${oceanDay}, #106ea1)`;
            clouds.forEach(cloud => {
                cloud.style.background = cloudDay;
                cloud.style.setProperty('--cloud-bg', cloudDay); // Might need a generic way if ::before/::after are tricky to select directly
                // Workaround for pseudo-elements: add a style tag or just use classes
            });
            // Apply day styles to pseudo-elements by toggling a class
            document.body.classList.remove('is-night');
            document.body.classList.add('is-day');

            // Map 6AM (360 mins) to 0% (left) and 6PM (1080 mins) to 100% (right)
            const progress = (totalMinutes - 360) / (1080 - 360);
            const xPos = progress * 100;
            // Parabola for height
            const yPos = 100 - (Math.sin(progress * Math.PI) * 80); // 20% to 100%

            celestialBody.style.left = `${xPos}%`;
            celestialBody.style.top = `${yPos}%`;

        } else {
            celestialBody.style.background = moonColor;
            celestialBody.style.boxShadow = `0 0 40px ${moonColor}`;
            videoBg.style.backgroundColor = skyNight;
            ocean.style.background = `linear-gradient(to bottom, ${oceanNight}, #020309)`;
            document.body.classList.remove('is-day');
            document.body.classList.add('is-night');

            // Map 6PM (1080 mins) to 0% (left) and 6AM (next day) to 100% (right)
            let progress;
            if (hours >= 18) {
                progress = (totalMinutes - 1080) / 720;
            } else {
                progress = (totalMinutes + 360) / 720;
            }
            const xPos = progress * 100;
            const yPos = 100 - (Math.sin(progress * Math.PI) * 80);

            celestialBody.style.left = `${xPos}%`;
            celestialBody.style.top = `${yPos}%`;
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
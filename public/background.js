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

//=============================
// Consts
//=============================
const MAX_WIDTH = 12;
const FPS = 60;

//=============================
// Helpers
//=============================
const getTimestamp = () => {
  return (new Date()).getTime();
};

const random = (max = 1, signed = false) => {
  return signed ? ((Math.random() - 0.5) * 2) * max : Math.random() * max;
};

let mouseStart = getTimestamp();

const getPower = () => {
  const power = (getTimestamp() - mouseStart) / 150;
  return power > 30 ? 30 : power;
};

//=============================
// Main
//=============================
document.addEventListener('DOMContentLoaded', () => {
    const targetDelta = 1000 / FPS;

    const stage = document.getElementById('stage');
    if (!stage) return; // Skip if not on page with volcano
    const ctx = stage.getContext('2d');
    const smoke = document.getElementById('smoke');
    const ctx2 = smoke.getContext('2d');

    let particles = [];

    let AWESOME_MODE = false;
    let mouseDown = false;
    let isExploding = false;
    let stageWidth = 0;
    let stageHeight = 0;
    let previousTimestamp = getTimestamp();
    let previousPower = 0;

    const volcanoContainer = document.querySelector('.volcano-container');
    const lavaEl = document.querySelector('.volcano-container .lava');

    const shakeVolcano = (power) => {
      if (volcanoContainer && lavaEl) {
          volcanoContainer.style.left = `${random(power, true)}px`;
          volcanoContainer.style.bottom = `${30 + (-1 * random(power))}px`;

          lavaEl.style.left = `${random(power, true)}px`;
          lavaEl.style.top = `${6 + (random(power) / 2)}px`;
          lavaEl.style.width = `${random(power) + 162}px`;
      }
    };

    const generateParticles = (amount = 20, power) => {
      for (let i = 0; i < amount; i++) {
        particles.push(new Particle(power));
      }
    };

    const loop = () => {
      if (getTimestamp() - previousTimestamp < targetDelta) {
        requestAnimationFrame(loop);
        return;
      }

      ctx.globalCompositeOperation = 'lighter';

      if (!AWESOME_MODE) {
        ctx.clearRect(0, 0, stageWidth, stageHeight);
      }

      ctx2.clearRect(0, 0, stageWidth, stageHeight);

      if (mouseDown) {
        generateParticles(random(2) + 1, getPower() / 2);
        shakeVolcano(getPower());
      }

      if (isExploding && previousPower > 0 && !mouseDown) {
        shakeVolcano(previousPower);
        previousPower -= 0.35;

        if (previousPower < 1) {
          isExploding = false;
          // Reset positioning
          if (volcanoContainer && lavaEl) {
            volcanoContainer.style.left = '0px';
            volcanoContainer.style.bottom = '30px';
            lavaEl.style.left = '0px';
            lavaEl.style.top = '6px';
            lavaEl.style.width = '162px';
          }
        }
      }

      // constant particles
      if (random() < 0.3) {
        generateParticles(1, 1);
      }

      // smoke effects
      if (random() < 0.08) {
        particles.push(new Smoke());
      }

      // animate
      particles.forEach((particle) => {
        particle.animate();
        particle.render();
      });

      // remove out of bounds particles
      particles = particles.filter(particle => {
        if (
          particle instanceof Smoke &&
          particle.y + particle.width > 0
        ) {
          return true;
        } else if (
          particle instanceof Particle &&
          particle.y < stageHeight &&
          particle.x > 0 - particle.width &&
          particle.x < stageWidth + particle.width
        ) {
          return true;
        } else {
          return false;
        }
      });

      previousTimestamp = getTimestamp();
      requestAnimationFrame(loop);
    };

    class Particle {
      constructor(oPower) {
        const power = oPower || random(5);

        this.x = (stageWidth / 2) + random(80, true);
        this.y = (stageHeight - 150) + random(20, true); // Adjusted starting y

        this.width = random(MAX_WIDTH) + 1;
        this.red = Math.floor(210 + (this.width * 2));
        this.green = Math.floor(90 + (this.width * 3));
        this.blue = Math.floor(30 + (this.width * 2));
        this.alpha = 1;
        this.speed = power / (this.width * 0.13);
        this.angle = random(45);
        this.hasBounced = false;

        this.velocityY = Math.abs(Math.sin(this.angle)) * this.speed;
        this.velocityX = Math.cos(this.angle) * this.speed / 2;

        this.xDirection = this.velocityX > 0;

        if (Math.abs(this.velocityX) > 2) {
          this.velocityX = this.velocityX / 2;
        }
      }

      animate() {
        this.x -= this.velocityX;
        this.y -= this.velocityY;

        // add gravity
        this.velocityY -= this.width / (this.hasBounced ? 170 : 100);

        if (
          !this.hasBounced &&
          random() < 0.1 &&
          this.y > stageHeight - 150 &&
          this.x > (stageWidth / 2) - 180 &&
          this.x < (stageWidth / 2) + 180
        ) {
          this.hasBounced = true;
          this.velocityX = Math.sin(random(45)) + (random(2) * this.xDirection);
          this.velocityY /= 8;
        }
      }

      render() {
        const colour = this.getColour();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2, true);
        ctx.lineWidth = this.width;
        ctx.fillStyle = colour;
        ctx.fill();
      }

      getColour(red, green, blue, alpha) {
        return `rgba(${red || this.red}, ${green || this.green}, ${blue || this.blue}, ${alpha || this.alpha})`;
      }
    }

    class Smoke {
      constructor() {
        this.x = (stageWidth / 2) + random(75, true);
        this.y = stageHeight - 100; // Adjusted starting y

        this.width = random(80) + 50;
        this.red = 100;
        this.green = 100;
        this.blue = 100;
        this.alpha = random() + 0.3;
        this.speed = random(2) + 1;
      }

      animate() {
        this.y -= this.speed;
      }

      render() {
        const colour = this.getColour();

        ctx2.beginPath();
        ctx2.arc(this.x, this.y, this.width, 0, Math.PI * 2, true);
        ctx2.lineWidth = this.width;
        ctx2.fillStyle = colour;
        ctx2.fill();
      }

      getColour(red, green, blue, alpha) {
        return `rgba(${red || this.red}, ${green || this.green}, ${blue || this.blue}, ${alpha || this.alpha})`;
      }
    }

    const updateCanvasSize = () => {
      stageWidth = window.innerWidth;
      stageHeight = window.innerHeight;

      stage.width = stageWidth;
      stage.height = stageHeight;

      smoke.width = stageWidth;
      smoke.height = stageHeight;

      particles = [];
    };

    if (volcanoContainer) {
      volcanoContainer.addEventListener('mousedown', () => {
        mouseStart = getTimestamp();
        mouseDown = true;

        if (AWESOME_MODE) {
          particles = [];
          ctx.clearRect(0, 0, stageWidth, stageHeight);
        }
      });

      volcanoContainer.addEventListener('touchstart', () => {
        mouseStart = getTimestamp();
        mouseDown = true;

        if (AWESOME_MODE) {
          particles = [];
          ctx.clearRect(0, 0, stageWidth, stageHeight);
        }
      });
    }

    const handleMouseUp = () => {
      if (!mouseDown) return;

      const power = getPower();

      isExploding = true;
      mouseDown = false;
      previousPower = power;

      generateParticles((random(16) + 30) * power, power / 1.1);

      setTimeout(() => {
        generateParticles(14 * power, power / 1.4);
      }, 100);

      setTimeout(() => {
        generateParticles(6 * power, power / 2);
      }, 200);

      setTimeout(() => {
        generateParticles(4 * power, power / 2);
      }, 400);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const toggleWrapper = document.querySelector('.toggle');
    if (toggleWrapper) {
      setTimeout(() => {
        toggleWrapper.style.display = 'block';
      }, 6000);

      const awesomeCheckbox = document.getElementById('awesome');
      if (awesomeCheckbox) {
        awesomeCheckbox.addEventListener('change', (e) => {
          AWESOME_MODE = e.target.checked;
        });
      }
    }

    generateParticles(200, 8);
    loop();
});

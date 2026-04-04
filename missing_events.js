    }

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

    // Hook nav links to slide transitions instead of native scrolling
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    navLinks.forEach((link) => {
        const targetId = link.getAttribute('href')?.slice(1);
        if (!targetId) return;
        const targetIndex = slides.findIndex((s) => s.id === targetId);
        if (targetIndex === -1) return;
        link.addEventListener('click', (e) => {
            // Any top-bar navigation should reveal the carousel again
            document.body.classList.remove('bg-viewing');
            if (window.innerWidth <= 768) {
                // On mobile, allow normal anchor scrolling
                return;
            }
            e.preventDefault();
            if (!isSliding) {
                goToSlide(targetIndex);
            }
        });
    });

    // Hook in-slide buttons/links (e.g. hero CTAs) to slide transitions
    const slideLinks = Array.from(document.querySelectorAll('.slides-viewport a[href^="#"]'));
    slideLinks.forEach((link) => {
        const targetId = link.getAttribute('href')?.slice(1);
        if (!targetId) return;
        const targetIndex = slides.findIndex((s) => s.id === targetId);
        if (targetIndex === -1) return;

        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                // On mobile, allow normal anchor scrolling
                return;
            }
            e.preventDefault();
            if (!isSliding) {
                goToSlide(targetIndex);
            }
        });
    });

    // Clicking a slide card recenters it (desktop only)
    if (window.innerWidth > 768 && slides.length) {
        slides.forEach((slide, index) => {
            slide.addEventListener('click', () => {
                if (!isSliding) {
                    goToSlide(index);
                }
            });
        });
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKey);
    if (window.innerWidth > 768) {
        goToSlide(0);
    }
    window.requestAnimationFrame(frame);
});

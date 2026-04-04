js = open('public/app.js').read()

start_idx = js.find('function initMusicWidget() {')
end_idx = js.find('function initBackgroundToggle() {')

js_before = js[:start_idx]
js_after = js[end_idx:]

clean = """function initMusicWidget() {
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
        
        updateActivePlaylistItem(filename);

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

    function updateActivePlaylistItem(playingFilename) {
        const items = document.querySelectorAll('.local-playlist-item');
        items.forEach(item => {
            if (item.dataset.filename === playingFilename) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Populate local playlist UI
    setTimeout(() => {
        const listEl = document.getElementById('local-playlist-list');
        if (listEl && window.LOCAL_SONGS && window.LOCAL_SONGS.length > 0) {
            listEl.innerHTML = '';
            window.LOCAL_SONGS.forEach(filename => {
                const li = document.createElement('li');
                li.className = 'local-playlist-item';
                li.textContent = filename.replace(/\.[^/.]+$/, "");
                li.dataset.filename = filename;
                li.addEventListener('click', () => {
                    playSpecificSong(filename, true);
                    if (musicToggle) {
                        musicToggle.dataset.state = 'playing';
                        musicToggle.textContent = 'Pause';
                    }
                });
                listEl.appendChild(li);
            });
        }
    }, 150);

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

"""

open('public/app.js', 'w').write(js_before + clean + js_after)
print("Safely overwrote initMusicWidget function in app.js")

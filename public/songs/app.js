const TRACKS = [
    { title: '40kb Memory',               src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/40kb%20Memory.mp3',               album: 'Trial 1' },
    { title: 'Bad Condition',             src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Bad%20Condition.mp3',             album: 'Trial 1' },
    { title: 'Buffer Stream Blue',        src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Buffer%20Stream%20Blue.mp3',        album: 'Trial 1' },
    { title: 'Cursor Trail',              src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Cursor%20Trail.mp3',              album: 'Trial 1' },
    { title: 'Desktop Meadow',            src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Desktop%20Meadow.mp3',            album: 'Trial 1' },
    { title: 'Dial-Up Lullaby',           src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Dial-Up%20Lullaby.mp3',           album: 'Trial 1' },
    { title: 'Heart Not Found',           src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Heart%20Not%20Found.mp3',           album: 'Trial 1' },
    { title: 'Pink Guestbook',            src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Pink%20Guestbook.mp3',            album: 'Trial 1' },
    { title: 'Under Construction Forever',src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Under%20Construction%20Forever.mp3',album: 'Trial 1' },
    { title: 'Winamp Visualiser',         src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Winampvisualiser.mp3',            album: 'Trial 1' },
    { title: 'Half Asleep',               src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Half%20Asleep.mp3',               album: 'Trial 1' },
    { title: 'Slow Scroll',               src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Slow%20Scroll.mp3',               album: 'Trial 1' },
    { title: 'Rain on the Blue Chair',    src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Rain%20on%20the%20Blue%20Chair.mp3',album: 'Trial 1' },
    { title: 'Pocket Reset',              src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Pocket%20Reset.mp3',              album: 'Trial 1' },
    { title: 'Rain On Glass',             src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Trial%201/Rain%20On%20Glass.mp3',            album: 'Trial 1' },
    { title: 'Comic Sans Heart',          src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Comic%20Sans%20Heart.mp3', album: 'Wayback Machine' },
    { title: 'Default Background',        src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Default%20Background.mp3', album: 'Wayback Machine' },
    { title: 'Equalizer Bars',            src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Equalizer%20Bars.mp3',    album: 'Wayback Machine' },
    { title: 'Geocities Ghost',           src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Geocities%20Ghost.mp3',   album: 'Wayback Machine' },
    { title: 'Last Modified',             src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Last%20Modified.mp3',     album: 'Wayback Machine' },
    { title: 'Loading Forever',           src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Loading%20Forever.mp3',   album: 'Wayback Machine' },
    { title: 'Modem Hymn',               src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Modem%20Hymn.mp3',        album: 'Wayback Machine' },
    { title: 'Profile Deactivated',       src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Profile%20Deactivated.mp3',album: 'Wayback Machine' },
    { title: 'Static Room',               src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Static%20Room.mp3',       album: 'Wayback Machine' },
    { title: 'Yellow Tape Sign',          src: 'https://raw.githubusercontent.com/Hackatoan/records/main/Wayback%20Machine/Yellow%20Tape%20Sign.mp3',album: 'Wayback Machine' },
];

// --- Shared state via sessionStorage ---
function saveState() {
    const s = {
        src: audio.src,
        trackIdx: currentIdx,
        time: audio.currentTime,
        paused: audio.paused,
        volume: audio.volume,
        shuffleOrder: shuffleOrder,
        trackIndex: trackIndex,
    };
    sessionStorage.setItem('hackatoa_player', JSON.stringify(s));
}

function loadState() {
    try {
        return JSON.parse(sessionStorage.getItem('hackatoa_player'));
    } catch {
        return null;
    }
}

// --- Player logic ---
const audio = new Audio();
let shuffleOrder = [...Array(TRACKS.length).keys()];
let trackIndex = 0;
let currentIdx = 0; // actual TRACKS index of current track

function findTrackIndex(src) {
    return TRACKS.findIndex((t) => t.src === src);
}

function setTrack(idx, play) {
    currentIdx = idx;
    audio.src = TRACKS[idx].src;
    audio.load();
    if (play) audio.play().catch(() => {});
    updateUI();
    saveState();
}

function updateUI() {
    const titleEl = document.getElementById('mini-title');
    const playBtn = document.getElementById('btn-play');
    if (titleEl) titleEl.innerHTML = `<strong>${TRACKS[currentIdx] ? TRACKS[currentIdx].title : 'No track'}</strong>`;
    if (playBtn) playBtn.textContent = audio.paused ? '▶ Play' : '⏸ Pause';

    document.querySelectorAll('.track-row').forEach((row, i) => {
        row.classList.remove('is-playing', 'is-paused');
        const btn = row.querySelector('.track-btn');
        if (i === currentIdx) {
            row.classList.add(audio.paused ? 'is-paused' : 'is-playing');
            if (btn) btn.textContent = audio.paused ? '▶ Resume' : '⏸ Pause';
        } else {
            if (btn) btn.textContent = '▶ Play';
        }
    });
}

// Restore state from main page if available
const saved = loadState();
if (saved && saved.src) {
    const idx = findTrackIndex(saved.src);
    currentIdx = idx >= 0 ? idx : 0;
    shuffleOrder = saved.shuffleOrder || shuffleOrder;
    trackIndex = saved.trackIndex || 0;
    audio.src = saved.src;
    audio.volume = saved.volume != null ? saved.volume : 0.25;
    audio.currentTime = saved.time || 0;
    // If it was playing on main page, keep playing
    if (!saved.paused) audio.play().catch(() => {});
} else {
    audio.volume = 0.25;
}

// Build track list grouped by album
const list = document.getElementById('track-list');
const albums = [...new Set(TRACKS.map(t => t.album))];
albums.forEach(album => {
    const header = document.createElement('div');
    header.className = 'album-header';
    header.textContent = album;
    list.appendChild(header);

    TRACKS.forEach((track, i) => {
        if (track.album !== album) return;
        const albumTracks = TRACKS.filter(t => t.album === album);
        const trackNum = albumTracks.indexOf(track) + 1;
        const row = document.createElement('div');
        row.className = 'track-row';
        row.dataset.idx = i;
        row.innerHTML = `
            <div class="track-num">${trackNum}</div>
            <div class="track-eq"><span></span><span></span><span></span></div>
            <div class="track-title">${track.title}</div>
            <button class="track-btn">▶ Play</button>
        `;
        const btn = row.querySelector('.track-btn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (i === currentIdx) {
                if (audio.paused) audio.play().catch(() => {});
                else audio.pause();
            } else {
                setTrack(i, true);
            }
            updateUI();
            saveState();
        });
        row.addEventListener('click', () => {
            if (i !== currentIdx) {
                setTrack(i, true);
            } else if (audio.paused) {
                audio.play().catch(() => {});
            } else {
                audio.pause();
            }
            updateUI();
            saveState();
        });
        list.appendChild(row);
    });
});

// Mini player controls
document.getElementById('btn-play').addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
    updateUI();
    saveState();
});
document.getElementById('btn-skip').addEventListener('click', () => {
    const next = (currentIdx + 1) % TRACKS.length;
    setTrack(next, !audio.paused);
});
document.getElementById('btn-prev').addEventListener('click', () => {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    const prev = (currentIdx - 1 + TRACKS.length) % TRACKS.length;
    setTrack(prev, !audio.paused);
});

// Progress bar
const fill = document.getElementById('progress-fill');
audio.addEventListener('timeupdate', () => {
    if (audio.duration) fill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
});
document.getElementById('progress-wrap').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
});

audio.addEventListener('ended', () => {
    const next = (currentIdx + 1) % TRACKS.length;
    setTrack(next, true);
});
audio.addEventListener('play', () => {
    updateUI();
    saveState();
});
audio.addEventListener('pause', () => {
    updateUI();
    saveState();
});

// Save state before navigating away
window.addEventListener('beforeunload', saveState);
window.addEventListener('pagehide', saveState);

updateUI();

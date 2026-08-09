const TRACKS = [
    { title: 'The Iron Basilica', src: 'https://records.hackatoa.com/album/The%20Iron%20Basilica.mp3', album: 'Latest Release', yt: '9QqKQnFhOwU' },
    { title: 'Found Me Here', src: 'https://records.hackatoa.com/album/Found%20Me%20Here.mp3', album: 'Latest Release', yt: 'HUxvN3Zb03Y' },
    { title: 'One Body', src: 'https://records.hackatoa.com/album/One%20Body.mp3', album: 'Latest Release', yt: 'MQh8NSRXD7s' },
    { title: 'Valley of Saints', src: 'https://records.hackatoa.com/album/Valley%20of%20Saints.mp3', album: 'Latest Release', yt: 'ORYwnjMLCUo' },
    { title: 'Known', src: 'https://records.hackatoa.com/album/Known.mp3', album: 'Latest Release', yt: 'aveHBQoHZjA' },
    { title: 'You Spoke to the Storm', src: 'https://records.hackatoa.com/album/You%20Spoke%20to%20the%20Storm.mp3', album: 'Latest Release', yt: 'h8-A_TWjhcs' },
    { title: 'The Wound That Heals', src: 'https://records.hackatoa.com/album/The%20Wound%20That%20Heals.mp3', album: 'Latest Release', yt: 'kmfZIJzPMG8' },
    { title: 'The Seventh Seal', src: 'https://records.hackatoa.com/album/The%20Seventh%20Seal.mp3', album: 'Latest Release', yt: 'wU_kXyTqj54' },
    { title: 'The Shepherd King', src: 'https://records.hackatoa.com/album/The%20Shepherd%20King.mp3', album: 'Latest Release', yt: 'xx3Rio6unWU' },
    { title: 'Comic Sans Heart', src: 'https://records.hackatoa.com/wayback/Comic%20Sans%20Heart.mp3', album: 'Wayback Machine', yt: '-Cucps3bLg0' },
    { title: 'Default Background', src: 'https://records.hackatoa.com/wayback/Default%20Background.mp3', album: 'Wayback Machine', yt: 'gYh3ePuZtt8' },
    { title: 'Equalizer Bars', src: 'https://records.hackatoa.com/wayback/Equalizer%20Bars.mp3', album: 'Wayback Machine', yt: '2tEC0uVieJQ' },
    { title: 'Geocities Ghost', src: 'https://records.hackatoa.com/wayback/Geocities%20Ghost.mp3', album: 'Wayback Machine', yt: 'brFTEpBVRm4' },
    { title: 'Last Modified', src: 'https://records.hackatoa.com/wayback/Last%20Modified.mp3', album: 'Wayback Machine', yt: '446AhqP-IC0' },
    { title: 'Loading Forever', src: 'https://records.hackatoa.com/wayback/Loading%20Forever.mp3', album: 'Wayback Machine', yt: 'DLOUY7xJPfE' },
    { title: 'Modem Hymn', src: 'https://records.hackatoa.com/wayback/Modem%20Hymn.mp3', album: 'Wayback Machine', yt: '4F9JTw_3Rmk' },
    { title: 'Profile Deactivated', src: 'https://records.hackatoa.com/wayback/Profile%20Deactivated.mp3', album: 'Wayback Machine', yt: 'o22r2tABL14' },
    { title: 'Static Room', src: 'https://records.hackatoa.com/wayback/Static%20Room.mp3', album: 'Wayback Machine', yt: 'j7QskVYaZcM' },
    { title: 'Yellow Tape Sign', src: 'https://records.hackatoa.com/wayback/Yellow%20Tape%20Sign.mp3', album: 'Wayback Machine', yt: 'xm7kYq_bxD0' },
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

// Build track list grouped by album (newest first, collapsible)
const list = document.getElementById('track-list');
const albums = [...new Set(TRACKS.map(t => t.album))];
albums.forEach((album, albumIdx) => {
    const albumTracks = TRACKS.map((t, i) => ({ ...t, i })).filter(t => t.album === album);
    const isOpen = albumIdx === 0; // first album (newest) open by default

    const header = document.createElement('div');
    header.className = 'album-header';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    header.innerHTML = `<span class="album-name">${album}</span><span class="album-chevron">${isOpen ? '▾' : '▸'}</span>`;

    const section = document.createElement('div');
    section.className = 'album-section';
    if (!isOpen) section.classList.add('album-collapsed');

    albumTracks.forEach((track, trackNum) => {
        const i = track.i;
        const row = document.createElement('div');
        row.className = 'track-row';
        row.dataset.idx = i;
        row.innerHTML = `
            <div class="track-num">${trackNum + 1}</div>
            <div class="track-eq"><span></span><span></span><span></span></div>
            <div class="track-title">${track.title}</div>
            <a class="track-btn yt-btn" href="https://youtu.be/${track.yt}" target="_blank" rel="noopener" aria-label="Watch ${track.title} on YouTube" onclick="event.stopPropagation()">YouTube ↗</a>
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
        section.appendChild(row);
    });

    const toggle = () => {
        const expanded = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        header.querySelector('.album-chevron').textContent = expanded ? '▸' : '▾';
        section.classList.toggle('album-collapsed', expanded);
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });

    list.appendChild(header);
    list.appendChild(section);
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

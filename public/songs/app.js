// records.hackatoa.com (the old homelab audio host) is retired — every track
// now plays via the YouTube IFrame API using the same video IDs the "Stream"
// buttons already linked out to.
const TRACKS = [
    { title: 'The Iron Basilica', album: 'The Iron Basilica', yt: '9QqKQnFhOwU' },
    { title: 'Found Me Here', album: 'The Iron Basilica', yt: 'HUxvN3Zb03Y' },
    { title: 'One Body', album: 'The Iron Basilica', yt: 'MQh8NSRXD7s' },
    { title: 'Valley of Saints', album: 'The Iron Basilica', yt: 'ORYwnjMLCUo' },
    { title: 'Known', album: 'The Iron Basilica', yt: 'aveHBQoHZjA' },
    { title: 'You Spoke to the Storm', album: 'The Iron Basilica', yt: 'h8-A_TWjhcs' },
    { title: 'The Wound That Heals', album: 'The Iron Basilica', yt: 'kmfZIJzPMG8' },
    { title: 'The Seventh Seal', album: 'The Iron Basilica', yt: 'wU_kXyTqj54' },
    { title: 'The Shepherd King', album: 'The Iron Basilica', yt: 'xx3Rio6unWU' },
    { title: 'Comic Sans Heart', album: 'Wayback Machine', yt: '-Cucps3bLg0' },
    { title: 'Default Background', album: 'Wayback Machine', yt: 'gYh3ePuZtt8' },
    { title: 'Equalizer Bars', album: 'Wayback Machine', yt: '2tEC0uVieJQ' },
    { title: 'Geocities Ghost', album: 'Wayback Machine', yt: 'brFTEpBVRm4' },
    { title: 'Last Modified', album: 'Wayback Machine', yt: '446AhqP-IC0' },
    { title: 'Loading Forever', album: 'Wayback Machine', yt: 'DLOUY7xJPfE' },
    { title: 'Modem Hymn', album: 'Wayback Machine', yt: '4F9JTw_3Rmk' },
    { title: 'Profile Deactivated', album: 'Wayback Machine', yt: 'o22r2tABL14' },
    { title: 'Static Room', album: 'Wayback Machine', yt: 'j7QskVYaZcM' },
    { title: 'Yellow Tape Sign', album: 'Wayback Machine', yt: 'xm7kYq_bxD0' },
    { title: 'Not a Lofi Track', album: 'Singles', yt: 'oUDfV9yTWGY' },
];

// --- Shared state via sessionStorage (persists across reloads of this page) ---
function saveState() {
    const s = {
        yt: TRACKS[currentIdx] ? TRACKS[currentIdx].yt : null,
        trackIdx: currentIdx,
        time: ytReady ? ytPlayer.getCurrentTime() : 0,
        paused: playerPaused,
        volume: pendingVolume,
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

function findTrackIndex(yt) {
    return TRACKS.findIndex((t) => t.yt === yt);
}

// --- Player state ---
let ytPlayer = null, ytReady = false, playerPaused = true, pendingVolume = 0.05;
let currentIdx = 0;
let pendingSeek = 0, pendingAutoplay = false;

function setTrack(idx, play) {
    currentIdx = idx;
    updateUI();
    if (!ytReady) { pendingAutoplay = play; return; }
    if (play) ytPlayer.loadVideoById(TRACKS[idx].yt);
    else ytPlayer.cueVideoById(TRACKS[idx].yt);
    saveState();
}

function updateUI() {
    const titleEl = document.getElementById('mini-title');
    const playBtn = document.getElementById('btn-play');
    if (titleEl) titleEl.innerHTML = `<strong>${TRACKS[currentIdx] ? TRACKS[currentIdx].title : 'No track'}</strong>`;
    if (playBtn) playBtn.textContent = playerPaused ? '▶ Play' : '⏸ Pause';

    document.querySelectorAll('.track-row').forEach((row, i) => {
        row.classList.remove('is-playing', 'is-paused');
        const btn = row.querySelector('.play-btn');
        if (i === currentIdx) {
            row.classList.add(playerPaused ? 'is-paused' : 'is-playing');
            if (btn) btn.textContent = playerPaused ? '▶ Resume' : '⏸ Pause';
        } else {
            if (btn) btn.textContent = '▶ Play';
        }
    });
}

function playPause() {
    if (!ytReady) return;
    if (playerPaused) ytPlayer.playVideo();
    else ytPlayer.pauseVideo();
}

// Restore state (self-referential — carries over across reloads of this page,
// e.g. via back/forward) before the YouTube API has necessarily loaded.
const saved = loadState();
if (saved && saved.yt) {
    const idx = findTrackIndex(saved.yt);
    currentIdx = idx >= 0 ? idx : 0;
    pendingVolume = saved.volume != null ? saved.volume : 0.05;
    pendingSeek = saved.time || 0;
    pendingAutoplay = !saved.paused;
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
            <a class="track-btn yt-btn" href="https://youtu.be/${track.yt}" target="_blank" rel="noopener" aria-label="Stream ${track.title} on YouTube" onclick="event.stopPropagation()">Stream ↗</a>
            <button class="track-btn play-btn">▶ Play</button>
        `;
        const btn = row.querySelector('.play-btn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (i === currentIdx) playPause();
            else setTrack(i, true);
        });
        row.addEventListener('click', () => {
            if (i !== currentIdx) setTrack(i, true);
            else playPause();
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
document.getElementById('btn-play').addEventListener('click', playPause);
document.getElementById('btn-skip').addEventListener('click', () => {
    const next = (currentIdx + 1) % TRACKS.length;
    setTrack(next, !playerPaused);
});
document.getElementById('btn-prev').addEventListener('click', () => {
    if (ytReady && ytPlayer.getCurrentTime() > 3) {
        ytPlayer.seekTo(0, true);
        return;
    }
    const prev = (currentIdx - 1 + TRACKS.length) % TRACKS.length;
    setTrack(prev, !playerPaused);
});

// Progress bar — YT has no timeupdate event, so poll while playing.
const fill = document.getElementById('progress-fill');
setInterval(() => {
    if (!ytReady || playerPaused) return;
    const d = ytPlayer.getDuration();
    if (d) fill.style.width = `${(ytPlayer.getCurrentTime() / d) * 100}%`;
}, 500);
document.getElementById('progress-wrap').addEventListener('click', (e) => {
    if (!ytReady) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const d = ytPlayer.getDuration();
    if (d) ytPlayer.seekTo(pct * d, true);
});

updateUI();

// --- YouTube IFrame API setup ---
// Kept out of layout flow but not display:none (some browsers stop <iframe>
// media entirely once display:none, which would silently kill playback).
const ytHost = document.createElement('div');
ytHost.id = 'yt-audio-host';
ytHost.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;bottom:0;right:0';
document.body.appendChild(ytHost);
window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('yt-audio-host', {
        height: '1', width: '1', videoId: TRACKS[currentIdx].yt,
        playerVars: { controls: 0, disablekb: 1, fs: 0, modestbranding: 1, playsinline: 1 },
        events: {
            onReady: function () {
                ytReady = true;
                ytPlayer.setVolume(Math.round(pendingVolume * 100));
                if (pendingSeek) ytPlayer.seekTo(pendingSeek, true);
                if (pendingAutoplay) ytPlayer.playVideo();
                updateUI();
            },
            onStateChange: function (e) {
                if (e.data === YT.PlayerState.PLAYING) { playerPaused = false; updateUI(); saveState(); }
                else if (e.data === YT.PlayerState.PAUSED) { playerPaused = true; updateUI(); saveState(); }
                else if (e.data === YT.PlayerState.ENDED) { setTrack((currentIdx + 1) % TRACKS.length, true); }
            },
            onError: function () { setTrack((currentIdx + 1) % TRACKS.length, true); }
        }
    });
};
(function () {
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
})();

// Save state before navigating away
window.addEventListener('beforeunload', saveState);
window.addEventListener('pagehide', saveState);

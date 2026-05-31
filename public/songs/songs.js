PE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Songs — Hackatoa</title>
  <meta name="description" content="Music playing on hackatoa.com — browse and preview all tracks." />
  <link rel="icon" href="/assets/me.ico" type="image/x-icon" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #0d1117;
      --surface:   #161b22;
      --border:    rgba(100, 180, 255, 0.12);
      --primary:   #58a6ff;
      --text-main: #e6edf3;
      --text-muted:#8b949e;
      --hover-bg:  #1f2937;
      --playing-bg:#1a2a3a;
    }

    body {
      background: radial-gradient(circle at 15% 0%, #1a2a3d 0, transparent 55%),
                  radial-gradient(circle at 85% 0%, #1a1a2e 0, transparent 55%),
                  linear-gradient(to bottom, #111827, var(--bg));
      color: var(--text-main);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem 6rem;
    }

    .back-link {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      margin-bottom: 2.5rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: var(--text-main); }
    .back-link::before { content: '←'; }

    .page-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .page-header h1 {
      font-size: clamp(1.6rem, 4vw, 2.4rem);
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .page-header p {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 0.4rem;
    }

    .track-list {
      width: 100%;
      max-width: 640px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .track-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--surface);
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .track-row:hover { background: var(--hover-bg); border-color: rgba(100,180,255,0.25); }
    .track-row.is-playing { background: var(--playing-bg); border-color: var(--primary); }

    .track-num {
      width: 1.5rem;
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .track-row.is-playing .track-num { display: none; }
    .track-eq {
      display: none;
      width: 1.5rem;
      height: 1.2rem;
      align-items: flex-end;
      gap: 2px;
      flex-shrink: 0;
    }
    .track-row.is-playing .track-eq { display: flex; }
    .track-eq span {
      flex: 1;
      background: var(--primary);
      border-radius: 1px;
      animation: eq-bar 0.8s ease-in-out infinite alternate;
    }
    .track-eq span:nth-child(2) { animation-delay: 0.15s; }
    .track-eq span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes eq-bar {
      from { height: 30%; }
      to   { height: 100%; }
    }
    .track-row.is-paused .track-eq span { animation-play-state: paused; }

    .track-title {
      flex: 1;
      font-size: 0.95rem;
    }
    .track-row.is-playing .track-title { color: var(--primary); font-weight: 600; }

    .track-btn {
      background: none;
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-muted);
      padding: 0.3rem 0.7rem;
      font-size: 0.78rem;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .track-btn:hover { color: var(--text-main); border-color: var(--primary); }
    .track-row.is-playing .track-btn { color: var(--primary); border-color: var(--primary); }

    /* Mini player bar at bottom */
    .mini-player {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: rgba(13, 17, 23, 0.92);
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--border);
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      z-index: 100;
    }
    .mini-player-title {
      flex: 1;
      font-size: 0.85rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mini-player-title strong { color: var(--text-main); }
    .mini-btn {
      background: none;
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-muted);
      padding: 0.35rem 0.8rem;
      font-size: 0.82rem;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }
    .mini-btn:hover { color: var(--text-main); border-color: var(--primary); }
    .mini-btn.active { color: var(--primary); border-color: var(--primary); }

    .progress-bar-wrap {
      width: 100%;
      height: 3px;
      background: rgba(255,255,255,0.08);
      border-radius: 2px;
      cursor: pointer;
      position: absolute;
      top: 0; left: 0;
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 2px;
      width: 0%;
      transition: width 0.5s linear;
    }
  </style>
</head>
<body>

<a class="back-link" href="/">Back to main</a>

<div class="page-header">
  <h1>🎵 Songs</h1>
  <p>All tracks in the player — click any to preview</p>
</div>

<div class="track-list" id="track-list"></div>

<div class="mini-player" id="mini-player">
  <div class="progress-bar-wrap" id="progress-wrap">
    <div class="progress-bar-fill" id="progress-fill"></div>
  </div>
  <div class="mini-player-title" id="mini-title"><strong>No track playing</strong></div>
  <button class="mini-btn" id="btn-prev">⏮</button>
  <button class="mini-btn" id="btn-play">▶ Play</button>
  <button class="mini-btn" id="btn-skip">⏭</button>
</div>

<script src="/songs/app.js">
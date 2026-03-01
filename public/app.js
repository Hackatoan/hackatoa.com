/**********************
 * EASY-EDIT POI DATA
 **********************/
const POIS = {
  // Dev forced other way:
  "poi-dev": {
    imgX: 1250,
    imgY: 900,
    labelX: 10,
    labelY: -72,
    lineGap: 6,
    minDx: 45,
    side: "right",
  },
  "poi-social": {
    imgX: 2000,
    imgY: 800,
    labelX: -10,
    labelY: -72,
    lineGap: 6,
    minDx: 45,
  },
  "poi-servers": {
    imgX: 620,
    imgY: 550,
    labelX: 10,
    labelY: -72,
    lineGap: 6,
    minDx: 45,
  },
  "poi-contact": {
    imgX: 1690,
    imgY: 450,
    labelX: -10,
    labelY: -72,
    lineGap: 6,
    minDx: 45,
  },
  "poi-donate": {
    imgX: 270,
    imgY: 720,
    labelX: 10,
    labelY: -72,
    lineGap: 6,
    minDx: 45,
  },
};

const YT_CHANNEL_ID = "UC4DtXR4xqvJIUsYbBKyju8g";
const GH_USER = "hackatoan";
const NOW_WORKING_REPO = "infinisweeper";
const MC_HOST = "mc.hackatoa.com";


const canvas = document.getElementById("islandCanvas");
const ctx = canvas.getContext("2d");
const img = new Image();
img.src = "assets/bg.png";

const poiLayer = document.getElementById("poi-layer");

let lockedId = null;
let isOverModal = false;
let closeTimer = null;
let lastMouse = { x: 0, y: 0 };
let lastAnchorPoiId = null;

// Modal placement memory to prevent bouncing
const modalPlacement = {}; // modalId -> quadrant class
const FLIP_MARGIN = 28; // hysteresis px

window.addEventListener("mousemove", (e) => {
  lastMouse.x = e.clientX;
  lastMouse.y = e.clientY;
});

function showToast() {
  const toast = document.getElementById("toast");
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 1400);
}

// Clipboard copy with feedback (used by multiple modals)
// eslint-disable-next-line no-unused-vars
function copyTxt(t) {
  navigator.clipboard.writeText(t);
  showToast();
}

// required for modal close buttons
// eslint-disable-next-line no-unused-vars
function forceClose() {
  lockedId = null;
  isOverModal = false;
  document
    .querySelectorAll(".modal")
    .forEach((m) => m.classList.remove("active"));
}

function scheduleClose() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    if (!lockedId && !isOverModal && window.innerWidth > 768) {
      document
        .querySelectorAll(".modal")
        .forEach((m) => m.classList.remove("active"));
    }
  }, 90);
}

function unhoverBox() {
  scheduleClose();
}

function hoverBox(modalId, anchorPoiId = null) {
  const target = document.getElementById(modalId);
  if (!target) return;

  if (closeTimer) clearTimeout(closeTimer);

  if (!lockedId && window.innerWidth > 768) {
    document
      .querySelectorAll(".modal")
      .forEach((m) => m.classList.remove("active"));
    target.classList.add("active");

    if (anchorPoiId) {
      lastAnchorPoiId = anchorPoiId;
      positionModalNearPOI(target, anchorPoiId, target.id);
    }

    typeModalTitle(target);

    // if modal appears under cursor, prevent immediate close
    requestAnimationFrame(() => {
      const el = document.elementFromPoint(lastMouse.x, lastMouse.y);
      if (el && el.closest && el.closest(".modal") === target) {
        isOverModal = true;
      }
    });
  }
}

function lockBox(modalId, anchorPoiId = null) {
  const target = document.getElementById(modalId);
  if (!target) return;

  if (window.innerWidth > 768) {
    lockedId = lockedId === modalId ? null : modalId;
    document
      .querySelectorAll(".modal")
      .forEach((m) => m.classList.remove("active"));

    if (lockedId) {
      target.classList.add("active");
      if (anchorPoiId) {
        lastAnchorPoiId = anchorPoiId;
        positionModalNearPOI(target, anchorPoiId, target.id);
      }
      typeModalTitle(target);
    }
  }
}

// Draw contain so POIs stay accurate
function drawContain() {
  const dpr = window.devicePixelRatio || 1;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  canvas.width = Math.floor(vw * dpr);
  canvas.height = Math.floor(vh * dpr);
  canvas.style.width = vw + "px";
  canvas.style.height = vh + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, vw, vh);

  const scale = Math.min(vw / img.width, vh / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const offX = (vw - drawW) / 2;
  const offY = (vh - drawH) / 2;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, offX, offY, drawW, drawH);

  return { scale, offX, offY, vw, vh };
}

// inward default (unless overridden)
function inwardSideFor(conf) {
  const mid = img.width / 2;
  return conf.imgX < mid ? "right" : "left";
}

// Layout leader (never backtracks)
function layoutPOI(poiEl, conf, t) {
  const { scale, offX, offY } = t;

  // Place POI at dot center (origin)
  const sx = offX + conf.imgX * scale;
  const sy = offY + conf.imgY * scale;
  poiEl.style.left = `${sx}px`;
  poiEl.style.top = `${sy}px`;
  poiEl.style.zIndex = String(8000 + Math.round(sy)); // lower draws on top

  const label = poiEl.querySelector(".label-text");
  const ui = poiEl.querySelector(".poi-ui");
  const svg = poiEl.querySelector(".leader-svg");
  const hit = poiEl.querySelector(".leader-hit");
  const path = poiEl.querySelector(".leader-path");

  const gap = conf.lineGap ?? 8;
  const minDx = conf.minDx ?? 16;

  const labelW = Math.ceil(label.offsetWidth);
  const labelH = Math.ceil(label.offsetHeight);

  const side = conf.side ?? inwardSideFor(conf);

  let labelX = conf.labelX ?? (side === "right" ? 10 : -10);
  let labelY = conf.labelY ?? -62;

  if (side === "left") {
    const kneeXWanted = labelX + labelW; // knee at right edge
    if (kneeXWanted > -minDx) labelX = -labelW - minDx;
  } else {
    const kneeXWanted = labelX; // knee at left edge
    if (kneeXWanted < minDx) labelX = minDx;
  }

  ui.style.transform = `translate(${labelX}px, ${labelY}px)`;

  const y = labelY + labelH + gap;

  let startX, kneeX;
  if (side === "left") {
    startX = labelX;
    kneeX = labelX + labelW;
  } else {
    startX = labelX + labelW;
    kneeX = labelX;
  }

  const startY = y,
    kneeY = y;
  const dotX = 0,
    dotY = 0;

  const pts = [
    { x: startX, y: startY },
    { x: kneeX, y: kneeY },
    { x: dotX, y: dotY },
  ];
  const pad = 14;
  const minXb = Math.min(...pts.map((p) => p.x)) - pad;
  const minYb = Math.min(...pts.map((p) => p.y)) - pad;
  const maxXb = Math.max(...pts.map((p) => p.x)) + pad;
  const maxYb = Math.max(...pts.map((p) => p.y)) + pad;

  svg.style.left = `${minXb}px`;
  svg.style.top = `${minYb}px`;
  svg.setAttribute("width", maxXb - minXb);
  svg.setAttribute("height", maxYb - minYb);

  const d =
    `M ${startX - minXb} ${startY - minYb} ` +
    `L ${kneeX - minXb}  ${kneeY - minYb} ` +
    `L ${dotX - minXb}   ${dotY - minYb}`;

  if (hit) hit.setAttribute("d", d);
  path.setAttribute("d", d);
}

function relayoutAll() {
  if (!img.complete || !img.naturalWidth) return;
  const t = drawContain();
  for (const [id, conf] of Object.entries(POIS)) {
    const el = document.getElementById(id);
    if (el) layoutPOI(el, conf, t);
  }

  // if something is locked open, keep it pinned near its POI
  if (lockedId && lastAnchorPoiId) {
    const modal = document.getElementById(lockedId);
    if (modal) positionModalNearPOI(modal, lastAnchorPoiId, lockedId);
  }
}

// Choose a quadrant near POI but biased away from screen center.
function chooseQuadrantFor(x, y, modalW, modalH, prevQuadrant) {
  const pad = 10;

  // Candidates: tl,tr,bl,br. Each gives a top-left corner relative to point.
  const candidates = [
    { q: "q-tl", dx: -modalW - 12, dy: -modalH - 14 },
    { q: "q-tr", dx: 12, dy: -modalH - 14 },
    { q: "q-bl", dx: -modalW - 12, dy: 14 },
    { q: "q-br", dx: 12, dy: 14 },
  ];

  // Score each candidate:
  // - prefer not clipping (heavy penalty)
  // - prefer moving away from center (small bonus)
  // - hysteresis: prefer previous unless meaningfully better
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  function clipPenalty(left, top) {
    const right = left + modalW;
    const bottom = top + modalH;
    let p = 0;
    if (left < pad) p += (pad - left) * 4;
    if (top < pad) p += (pad - top) * 4;
    if (right > window.innerWidth - pad)
      p += (right - (window.innerWidth - pad)) * 4;
    if (bottom > window.innerHeight - pad)
      p += (bottom - (window.innerHeight - pad)) * 4;
    return p;
  }

  function awayFromCenterBonus(left, top) {
    const mx = left + modalW / 2;
    const my = top + modalH / 2;
    const dist = Math.hypot(mx - cx, my - cy);
    return dist * 0.02; // tiny
  }

  const scored = candidates.map((c) => {
    const left = x + c.dx;
    const top = y + c.dy;
    const penalty = clipPenalty(left, top);
    const bonus = awayFromCenterBonus(left, top);
    let score = penalty - bonus;
    if (prevQuadrant && c.q === prevQuadrant) score -= FLIP_MARGIN; // hysteresis (prefer staying)
    return { ...c, score, left, top };
  });

  scored.sort((a, b) => a.score - b.score);
  return scored[0].q;
}

// Position modal near POI dot with quadrant bias + hysteresis.
function positionModalNearPOI(modalEl, poiId, modalIdOverride = null) {
  const poi = document.getElementById(poiId);
  if (!poi) return;

  const dot = poi.querySelector(".dot");
  if (!dot) return;

  const key = modalIdOverride || modalEl.id;

  const dotRect = dot.getBoundingClientRect();
  const x = dotRect.left + dotRect.width / 2;
  const y = dotRect.top + dotRect.height / 2;

  // Place anchor point
  modalEl.style.left = `${x}px`;
  modalEl.style.top = `${y}px`;

  requestAnimationFrame(() => {
    // Measure once
    const r = modalEl.getBoundingClientRect();
    const modalW = r.width;
    const modalH = r.height;

    const prevQ = modalPlacement[key];
    const q = chooseQuadrantFor(x, y, modalW, modalH, prevQ);

    modalPlacement[key] = q;

    // Apply quadrant classes
    modalEl.classList.remove("q-tl", "q-tr", "q-bl", "q-br");
    modalEl.classList.add(q);

    // Clamp by shifting the anchor point (left/top) if needed
    requestAnimationFrame(() => {
      const rr = modalEl.getBoundingClientRect();
      const pad = 10;

      let newLeft = x;
      let newTop = y;

      // Horizontal clamp
      if (rr.left < pad) newLeft = x + (pad - rr.left);
      if (rr.right > window.innerWidth - pad)
        newLeft = x - (rr.right - (window.innerWidth - pad));

      // Vertical clamp
      // For q-t* (above), if top clips, push down; for q-b* (below), if bottom clips, push up
      if (rr.top < pad) newTop = y + (pad - rr.top);
      if (rr.bottom > window.innerHeight - pad)
        newTop = y - (rr.bottom - (window.innerHeight - pad));

      modalEl.style.left = `${newLeft}px`;
      modalEl.style.top = `${newTop}px`;
    });
    // final position is set above via `newLeft`/`newTop` and already clamped where necessary
  });
}

// Interactions: only dot / label / line trigger
function bindPOIInteractions(poiId, modalId) {
  const poi = document.getElementById(poiId);
  if (!poi) return;

  const dot = poi.querySelector(".dot");
  const label = poi.querySelector(".poi-ui");
  const line =
    poi.querySelector(".leader-hit") || poi.querySelector(".leader-path");

  const targets = [dot, label, line].filter(Boolean);

  targets.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      poi.classList.add("hovering");
      hoverBox(modalId, poiId);
    });
    el.addEventListener("mouseleave", () => {
      poi.classList.remove("hovering");
      unhoverBox();
    });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      lockBox(modalId, poiId);
    });
  });
}

// POI parallax only
window.addEventListener("mousemove", (e) => {
  if (window.innerWidth > 768) {
    const x = (e.clientX / window.innerWidth - 0.5) * 14;
    const y = (e.clientY / window.innerHeight - 0.5) * 14;
    poiLayer.style.transform = `translate(${-x}px, ${-y}px)`;
  }
});

// Ambient stats
async function initAmbient() {
  const uptimeEl = document.getElementById("amb-uptime");
  const buildEl = document.getElementById("amb-build");

  uptimeEl.textContent = "--";
  buildEl.textContent = "--";

  try {
    const res = await fetch("/status.json", { cache: "no-store" });
    if (!res.ok) throw new Error();
    const data = await res.json();

    buildEl.textContent = data.build || "--";

    const startedMs = new Date(data.started).getTime();
    const renderUptime = () => {
      const ms = Date.now() - startedMs;
      const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
      const hrs = Math.max(0, Math.floor((ms / (1000 * 60 * 60)) % 24));
      const mins = Math.max(0, Math.floor((ms / (1000 * 60)) % 60));
      uptimeEl.textContent = `${days}d ${hrs}h ${mins}m`;
    };

    renderUptime();
    setInterval(renderUptime, 60_000);
  } catch {
    // keep "--" with no console spam
  }
}

// Typing effect for modal title (fast + subtle)
const typingState = new Map(); // modalId -> timer
function typeModalTitle(modalEl) {
  if (!modalEl || window.innerWidth <= 768) return;

  const h2 = modalEl.querySelector("h2[data-title]");
  if (!h2) return;

  const full = h2.getAttribute("data-title") || h2.textContent;
  const key = modalEl.id;

  // Don’t retrigger if already fully typed and active
  if (h2.textContent === full && modalEl.classList.contains("active")) return;

  // Clear any existing timer
  if (typingState.has(key)) {
    clearInterval(typingState.get(key));
    typingState.delete(key);
  }

  h2.textContent = "";
  let i = 0;

  const timer = setInterval(() => {
    i++;
    h2.textContent = full.slice(0, i);
    if (i >= full.length) {
      clearInterval(timer);
      typingState.delete(key);
    }
  }, 14); // speed

  typingState.set(key, timer);
}

/**********************
 * DATA WIDGETS (no API keys)
 **********************/

// 1) Latest YT upload (avoid live/VOD when possible) + nocookie + clean allow list
async function fetchLatestYouTube() {
  const container = document.getElementById("yt-video");
  if (!container) return;

  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(api);
    const data = await res.json();
    if (!data.items || !data.items.length) return;

    const LIVE_TITLE_RE = /\b(live|livestream|stream|vod|replay|premiere)\b/i;

    const getVideoId = (item) => {
      const link = item.link || "";
      const m = link.match(/[?&]v=([^&]+)/);
      if (m && m[1]) return m[1];
      const guid = item.guid || "";
      const g = guid.match(/yt:video:([A-Za-z0-9_-]+)/);
      if (g && g[1]) return g[1];
      return null;
    };

    const pick =
      data.items.find((it) => !LIVE_TITLE_RE.test(it.title || "")) ||
      data.items[0];

    const videoId = getVideoId(pick);
    if (!videoId) return;

    container.innerHTML = `
          <iframe
            src="https://www.youtube-nocookie.com/embed/${videoId}"
            frameborder="0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen>
          </iframe>
        `;
  } catch {
    // no console spam
  }
}

// 2) Now Working On: infinisweeper repo + short description
async function renderNowWorking() {
  const el = document.getElementById("now-working");
  if (!el) return;

  try {
    const repoRes = await fetch(
      `https://api.github.com/repos/${GH_USER}/${NOW_WORKING_REPO}`,
    );
    if (!repoRes.ok) throw new Error();
    const repo = await repoRes.json();

    el.innerHTML = `
          <strong>Now Working On</strong><br>
          <a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a>
          ${repo.description ? `<div class="tiny muted" style="margin-top:6px;">${escapeHtml(repo.description)}</div>` : ""}
          <div class="tiny" style="margin-top:10px;">
            ⭐ ${repo.stargazers_count} &nbsp; • &nbsp; 🍴 ${repo.forks_count} &nbsp; • &nbsp;
            Updated: ${new Date(repo.pushed_at).toLocaleDateString()}
          </div>
        `;
  } catch {
// no console spam, just fail silently with no content
  }
}

// 3) Terminal-style activity log (real via public events API)
async function renderTerminalLog() {
  const el = document.getElementById("terminal-log");
  if (!el) return;

  try {
    const res = await fetch(
      `https://api.github.com/users/${GH_USER}/events/public`,
    );
    if (!res.ok) throw new Error();
    const events = await res.json();

    const pushes = events.filter((e) => e.type === "PushEvent").slice(0, 5);
    if (!pushes.length) throw new Error();

    const lines = [];
    lines.push(`<strong>Activity Log</strong>`);
    pushes.forEach((p) => {
      const repo = p.repo?.name || "repo";
      const msg = p.payload?.commits?.[0]?.message?.split("\n")[0] || "update";
      const when = new Date(p.created_at).toLocaleDateString();
      lines.push(
        `<span class="muted">> git push</span> <span>${escapeHtml(repo)}</span> <span class="muted">(${when})</span>`,
      );
      lines.push(`<span class="tiny">  ${escapeHtml(msg)}</span>`);
    });

    el.innerHTML = lines.join("<br>");
  } catch {
    el.innerHTML = `<strong>Activity Log</strong><br><span class="muted">Unavailable</span>`;}
}

// 4) GitHub latest commit for the latest-pushed repo (single repo)
async function renderGitHubLatestRepo() {
  const el = document.getElementById("github-card");
  if (!el) return;

  try {
    const repoRes = await fetch(
      `https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=1`,
    );
    if (!repoRes.ok) throw new Error();
    const repos = await repoRes.json();
    if (!repos.length) throw new Error();

    const repo = repos[0];

    const commitRes = await fetch(
      `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`,
    );
    if (!commitRes.ok) throw new Error();
    const commits = await commitRes.json();
    const latest = commits[0];

    const message = latest?.commit?.message?.split("\n")[0] || "update";
    const date = latest?.commit?.author?.date
      ? new Date(latest.commit.author.date).toLocaleString()
      : "";

    el.innerHTML = `
          <strong>Latest Commit</strong><br>
          <div style="margin-top:6px;">
            <a href="${repo.html_url}" target="_blank" rel="noopener">${escapeHtml(repo.name)}</a>
          </div>
          <div class="mono" style="margin-top:10px;">"${escapeHtml(message)}"</div>
          <div class="tiny muted" style="margin-top:8px;">${escapeHtml(date)}</div>
        `;
  } catch  {
    el.innerHTML = `<strong>Latest Commit</strong><br><span class="muted">Unavailable</span>`;
  }
}

// 5) Minecraft server status via mcsrvstat.us
async function fetchMinecraftStatus() {
  const el = document.getElementById("mc-status");
  if (!el) return;

  try {
    const res = await fetch(
      `https://api.mcsrvstat.us/2/${encodeURIComponent(MC_HOST)}`,
    );
    if (!res.ok) throw new Error();
    const data = await res.json();

    if (!data.online) {
      el.innerHTML = `<strong>Server Status</strong><br><span class="muted">🔴 Offline</span>`;
      return;
    }

    const players = data.players
      ? `${data.players.online} / ${data.players.max}`
      : "—";
    const version = data.version || "—";
    const motd = data.motd?.clean ? data.motd.clean.join(" ") : "";

    el.innerHTML = `
          <strong>Server Status</strong><br>
          🟢 Online<br>
          👥 Players: ${players}<br>
          🧩 Version: ${escapeHtml(version)}<br>
          ${motd ? `<div class="tiny muted" style="margin-top:10px;">${escapeHtml(motd)}</div>` : ""}
        `;
  } catch  {
    el.innerHTML = `<strong>Server Status</strong><br><span class="muted">Unavailable</span>`;
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

img.onload = () => {
  initAmbient();

  relayoutAll();

  // content widgets
  fetchLatestYouTube();
  renderNowWorking();
  renderTerminalLog();
  renderGitHubLatestRepo();
  fetchMinecraftStatus();
};

window.addEventListener("resize", relayoutAll);

function bindAllPOIs() {
  bindPOIInteractions("poi-dev", "m-dev");
  bindPOIInteractions("poi-social", "m-social");
  bindPOIInteractions("poi-servers", "m-servers");
  bindPOIInteractions("poi-contact", "m-contact");
  bindPOIInteractions("poi-donate", "m-donate");
}

document.addEventListener("DOMContentLoaded", () => {
  bindAllPOIs();

  // If the image is already cached and complete, run layout immediately
  if (img.complete && img.naturalWidth) {
    relayoutAll();
  }
  // ensure content widgets run even if image load doesn't trigger onload
  fetchLatestYouTube();
  renderNowWorking();
  renderTerminalLog();
  renderGitHubLatestRepo();
  fetchMinecraftStatus();
});

img.onerror = () => {
  initAmbient();
  // still bind + show modals via POIs even if map image fails
  relayoutAll();
  // still attempt to load content widgets when the background image fails
  fetchLatestYouTube();
  renderNowWorking();
  renderTerminalLog();
  renderGitHubLatestRepo();
  fetchMinecraftStatus();
};

// Use your existing reference here:

const spriteFrames = [
  { src: "assets/sprite/sprite_0.png", duration: 5000 },
  { src: "assets/sprite/sprite_1.png", duration: 400 },
  { src: "assets/sprite/sprite_2.png", duration: 50 },
  { src: "assets/sprite/sprite_3.png", duration: 300 },
];

// --- Preload to avoid flashing/flicker ---
const preloaded = spriteFrames.map((f) => {
  const im = new Image();
  im.src = f.src;
  return im;
});

// --- Animation state ---
let i = 0;
let lastT = 0;
let elapsed = 0;
let rafId = null;
let running = false;

function applyFrame(index) {
  // Use preloaded src (still just a URL), but ensures browser has it cached
  img.src = preloaded[index].src;
}

function tick(t) {
  if (!running) return;

  if (!lastT) lastT = t;
  const dt = t - lastT;
  lastT = t;

  elapsed += dt;

  // Advance through frames even if the browser hiccups / tab was hidden
  while (elapsed >= spriteFrames[i].duration) {
    elapsed -= spriteFrames[i].duration;
    i = (i + 1) % spriteFrames.length;
    applyFrame(i);
  }

  rafId = requestAnimationFrame(tick);
}

function startBgAnim() {
  if (running) return;
  running = true;
  lastT = 0;
  elapsed = 0;
  i = 0;
  applyFrame(i);
  rafId = requestAnimationFrame(tick);
}

function stopBgAnim() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

// Auto-pause when tab is hidden (optional but recommended)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopBgAnim();
  else startBgAnim();
});

// Start it
startBgAnim();

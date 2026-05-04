import { Router, type IRouter } from "express";
import { VERSION } from "../lib/version";

const router: IRouter = Router();

const CHANGELOG: { version: string; date: string; tag: string; notes: string[] }[] = [
  {
    version: "1.0.2",
    date: "2026-05-03",
    tag: "current",
    notes: [
      "Rich result card — thumbnail, title, author, stats, description, download buttons",
      "View count formatted (1.7B, 3.2M, 450K)",
      "Expandable description with Read more / Show less",
      "Show JSON toggle for developers",
      "Smooth loading skeleton while fetching",
    ],
  },
  {
    version: "1.0.1",
    date: "2026-05-03",
    tag: "",
    notes: [
      "Added changelog to the web home page",
      "Improved web UI — fully mobile & desktop responsive",
      "API output is now auto pretty-printed (2-space JSON)",
      "Gzip compression on all responses for faster fetches",
      "Cache-Control headers on download responses",
      "Syntax-highlighted JSON in the live tester",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-05-01",
    tag: "initial",
    notes: [
      "YouTube URL and title/keyword search support",
      "Real-time metadata: title, author, channel, duration, views, description",
      "MP4 HD + MP3 direct download links",
      "90-second in-memory response cache",
      "24-hour auto-restart in production",
      "Deployable on Replit, Render, and Vercel",
    ],
  },
];

function buildHtml(version: string): string {
  const changelogHtml = CHANGELOG.map((entry) => {
    const notes = entry.notes.map((n) => `<li>${n}</li>`).join("");
    const tagHtml =
      entry.tag === "current"
        ? `<span class="cl-tag current">Current</span>`
        : entry.tag === "initial"
        ? `<span class="cl-tag">Initial</span>`
        : "";
    return `
    <div class="cl-entry">
      <div class="cl-header">
        <div class="cl-left">
          <span class="cl-ver">v${entry.version}</span>
          ${tagHtml}
        </div>
        <span class="cl-date">${entry.date}</span>
      </div>
      <ul class="cl-list">${notes}</ul>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>YouTube API — MJL</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           background: #0d0d0f; color: #d4d4d8; min-height: 100vh; }

    /* ── HERO ── */
    .hero { background: linear-gradient(140deg, #900 0%, #e00 50%, #ff4444 100%);
            padding: clamp(40px,8vw,72px) 20px clamp(32px,6vw,56px); text-align: center; }
    .hero h1 { font-size: clamp(2rem,6vw,3.2rem); font-weight: 900; color: #fff; letter-spacing: -1px; line-height: 1.1; }
    .hero p  { margin-top: 10px; color: rgba(255,255,255,.82); font-size: clamp(.9rem,2.5vw,1.05rem); }
    .badges  { display: flex; gap: 8px; justify-content: center; margin-top: 16px; flex-wrap: wrap; }
    .badge   { background: rgba(255,255,255,.18); backdrop-filter: blur(4px); color: #fff;
               padding: 5px 14px; border-radius: 20px; font-size: .76rem; font-weight: 700; letter-spacing: .4px; }

    /* ── NAV ── */
    .nav { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;
           padding: 18px 20px; border-bottom: 1px solid #1f1f23; }
    .nav a { color: #a1a1aa; text-decoration: none; font-size: .82rem; font-weight: 600;
             padding: 6px 14px; border-radius: 20px; border: 1px solid #27272a; transition: all .15s; }
    .nav a:hover { color: #fff; border-color: #52525b; background: #18181b; }

    /* ── LAYOUT ── */
    .wrap { max-width: 860px; margin: 0 auto; padding: clamp(24px,4vw,44px) 16px 64px; }

    /* ── CARDS ── */
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 16px;
            padding: clamp(18px,4vw,28px); margin-bottom: 20px; }
    .card-title { font-size: .82rem; font-weight: 800; color: #fff; text-transform: uppercase;
                  letter-spacing: .8px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

    /* ── ENDPOINTS ── */
    .ep { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px;
          background: #0d0d0f; border: 1px solid #27272a; border-radius: 10px;
          padding: 10px 14px; margin-bottom: 8px;
          font-family: 'Menlo','Consolas',monospace; font-size: .84rem; }
    .ep:last-child { margin-bottom: 0; }
    .get     { background: #22c55e; color: #000; padding: 3px 9px; border-radius: 5px;
               font-size: .7rem; font-weight: 900; text-align: center; white-space: nowrap; }
    .ep-path { color: #60a5fa; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ep-desc { color: #52525b; font-family: sans-serif; font-size: .75rem; text-align: right; white-space: nowrap; }
    @media (max-width: 520px) { .ep { grid-template-columns: auto 1fr; } .ep-desc { display: none; } }

    /* ── TESTER INPUT ── */
    .tester-row   { display: flex; gap: 10px; }
    .tester-input { flex: 1; min-width: 0; background: #0d0d0f; border: 1px solid #3f3f46;
                    border-radius: 10px; color: #e4e4e7; padding: 13px 16px; font-size: .93rem;
                    outline: none; transition: border-color .2s; }
    .tester-input:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.15); }
    .tester-input::placeholder { color: #52525b; }
    .btn { background: #ef4444; color: #fff; border: none; padding: 13px 22px; border-radius: 10px;
           cursor: pointer; font-size: .93rem; font-weight: 700; transition: background .15s, transform .1s;
           white-space: nowrap; }
    .btn:hover:not(:disabled) { background: #dc2626; transform: translateY(-1px); }
    .btn:active:not(:disabled) { transform: translateY(0); }
    .btn:disabled { background: #3f3f46; color: #71717a; cursor: not-allowed; }
    @media (max-width: 480px) { .tester-row { flex-direction: column; } .btn { width: 100%; } }

    /* ── RESULT CARD ── */
    #result-area { margin-top: 18px; display: none; }

    .result-card { background: #0d0d0f; border: 1px solid #27272a; border-radius: 12px;
                   overflow: hidden; }

    .result-inner { display: grid; grid-template-columns: 200px 1fr; gap: 0; }
    @media (max-width: 580px) { .result-inner { grid-template-columns: 1fr; } }

    .result-thumb-wrap { position: relative; flex-shrink: 0; }
    .result-thumb-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 130px; }
    .dur-badge { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,.82);
                 color: #fff; font-size: .72rem; font-weight: 700; padding: 2px 7px;
                 border-radius: 5px; font-family: monospace; letter-spacing: .3px; }
    .cached-badge { position: absolute; top: 8px; left: 8px; background: rgba(34,197,94,.2);
                    color: #22c55e; font-size: .65rem; font-weight: 800; padding: 2px 7px;
                    border-radius: 5px; letter-spacing: .4px; text-transform: uppercase; }

    .result-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }

    .result-title { font-size: 1rem; font-weight: 700; color: #fff; line-height: 1.35;
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .result-author { font-size: .82rem; color: #60a5fa; text-decoration: none; font-weight: 600; }
    .result-author:hover { color: #93c5fd; }

    .result-stats { display: flex; flex-wrap: wrap; gap: 6px 14px; }
    .stat { font-size: .78rem; color: #71717a; display: flex; align-items: center; gap: 5px; }
    .stat-icon { font-size: .9em; }

    .result-desc-wrap { font-size: .82rem; color: #a1a1aa; line-height: 1.6; }
    .result-desc-text { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                        overflow: hidden; white-space: pre-line; }
    .result-desc-text.expanded { -webkit-line-clamp: unset; }
    .read-more { background: none; border: none; color: #ef4444; font-size: .78rem; font-weight: 700;
                 cursor: pointer; padding: 2px 0; margin-top: 4px; display: block; }
    .read-more:hover { color: #fca5a5; }

    /* ── DOWNLOAD BUTTONS ── */
    .dl-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
    .dl-btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px;
              border-radius: 9px; font-size: .85rem; font-weight: 700; text-decoration: none;
              transition: all .15s; border: none; cursor: pointer; }
    .dl-mp4 { background: rgba(239,68,68,.15); color: #f87171; border: 1px solid rgba(239,68,68,.3); }
    .dl-mp4:hover { background: rgba(239,68,68,.25); color: #fca5a5; }
    .dl-mp3 { background: rgba(96,165,250,.12); color: #60a5fa; border: 1px solid rgba(96,165,250,.25); }
    .dl-mp3:hover { background: rgba(96,165,250,.22); color: #93c5fd; }
    .dl-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

    /* ── JSON TOGGLE ── */
    .json-toggle-row { display: flex; justify-content: flex-end; margin-top: 10px; }
    .json-toggle { background: none; border: 1px solid #27272a; color: #52525b;
                   font-size: .75rem; font-weight: 600; padding: 4px 12px; border-radius: 6px;
                   cursor: pointer; transition: all .15s; }
    .json-toggle:hover { color: #a1a1aa; border-color: #3f3f46; }

    /* ── SKELETON ── */
    .skeleton { background: #0d0d0f; border: 1px solid #27272a; border-radius: 12px; padding: 20px;
                display: none; gap: 14px; }
    .skel-line { background: linear-gradient(90deg,#1f1f23 25%,#27272a 50%,#1f1f23 75%);
                 background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; height: 14px; }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    /* ── JSON BOX ── */
    .json-wrap { margin-top: 10px; display: none; }
    .copy-row  { display: flex; justify-content: flex-end; margin-bottom: 6px; }
    .copy-btn  { background: #27272a; color: #a1a1aa; border: 1px solid #3f3f46; border-radius: 6px;
                 padding: 4px 10px; font-size: .72rem; cursor: pointer; font-weight: 600; transition: all .15s; }
    .copy-btn:hover { background: #3f3f46; color: #fff; }
    pre.box { background: #0a0a0c; border: 1px solid #27272a; border-radius: 10px; padding: 16px;
              font-family: 'Menlo','Consolas',monospace; font-size: .78rem; line-height: 1.65;
              overflow: auto; white-space: pre-wrap; word-break: break-all; max-height: 380px; }
    pre.box.err { color: #fca5a5; }
    .jk { color: #f87171; } .js { color: #86efac; } .jn { color: #fbbf24; } .jb { color: #818cf8; }

    /* ── ERROR BOX ── */
    .err-box { background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.25);
               border-radius: 12px; padding: 16px 20px; color: #fca5a5; font-size: .88rem;
               display: none; line-height: 1.6; }

    /* ── ABOUT ── */
    .about p { color: #a1a1aa; line-height: 1.8; font-size: .95rem; }
    .about code { background: #27272a; color: #e4e4e7; padding: 1px 6px; border-radius: 4px;
                  font-size: .88em; font-family: monospace; }
    .about strong { color: #e4e4e7; }

    /* ── CHANGELOG ── */
    .cl-entry { padding: 18px 0; border-bottom: 1px solid #27272a; }
    .cl-entry:last-child { border-bottom: none; padding-bottom: 0; }
    .cl-entry:first-child { padding-top: 0; }
    .cl-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .cl-left   { display: flex; align-items: center; gap: 10px; }
    .cl-ver    { font-size: 1rem; font-weight: 800; color: #fff; font-family: monospace; }
    .cl-tag    { font-size: .7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px;
                 background: #27272a; color: #71717a; letter-spacing: .4px; }
    .cl-tag.current { background: rgba(34,197,94,.15); color: #22c55e; }
    .cl-date   { font-size: .78rem; color: #52525b; }
    .cl-list   { list-style: none; display: flex; flex-direction: column; gap: 6px; }
    .cl-list li { color: #a1a1aa; font-size: .88rem; padding-left: 18px; position: relative; line-height: 1.5; }
    .cl-list li::before { content: '→'; position: absolute; left: 0; color: #ef4444; font-weight: 700; }

    /* ── DISCLAIMER ── */
    .disc p { color: #a1a1aa; line-height: 1.8; font-size: .92rem; }
    .disc strong { color: #fbbf24; }

    /* ── FOOTER ── */
    footer { text-align: center; padding: 32px 20px; color: #3f3f46; font-size: .8rem;
             border-top: 1px solid #18181b; }
    footer strong { color: #52525b; }
  </style>
</head>
<body>

<div class="hero">
  <h1>YouTube API</h1>
  <p>Real-time metadata · MP4 HD &amp; MP3 download links</p>
  <div class="badges">
    <span class="badge">v${version}</span>
    <span class="badge">by MJL</span>
    <span class="badge">YouTube Only</span>
  </div>
</div>

<nav class="nav">
  <a href="#endpoints">Endpoints</a>
  <a href="#tester">Try it</a>
  <a href="#about">About</a>
  <a href="#changelog">Changelog</a>
  <a href="#disclaimer">Disclaimer</a>
</nav>

<div class="wrap">

  <!-- Endpoints -->
  <div class="card" id="endpoints">
    <div class="card-title">⚡ Endpoints</div>
    <div class="ep">
      <span class="get">GET</span>
      <span class="ep-path">/api/v1/q?=(url or title)</span>
      <span class="ep-desc">Video info + download links</span>
    </div>
    <div class="ep">
      <span class="get">GET</span>
      <span class="ep-path">/api/uptime</span>
      <span class="ep-desc">Server uptime &amp; status</span>
    </div>
    <div class="ep">
      <span class="get">GET</span>
      <span class="ep-path">/api/healthz</span>
      <span class="ep-desc">Health check</span>
    </div>
  </div>

  <!-- Live Tester -->
  <div class="card" id="tester">
    <div class="card-title">🔬 Try It</div>

    <div class="tester-row">
      <input class="tester-input" id="q" type="text"
             placeholder="YouTube URL or title — e.g. bohemian rhapsody" />
      <button class="btn" id="search-btn" onclick="run()">Search</button>
    </div>

    <!-- Skeleton loader -->
    <div class="skeleton" id="skeleton">
      <div class="skel-line" style="width:60%;height:18px"></div>
      <div class="skel-line" style="width:35%"></div>
      <div class="skel-line" style="width:80%"></div>
      <div class="skel-line" style="width:80%"></div>
      <div class="skel-line" style="width:45%;height:32px;border-radius:9px;margin-top:6px"></div>
    </div>

    <!-- Error -->
    <div class="err-box" id="err-box"></div>

    <!-- Rich result -->
    <div id="result-area">
      <div class="result-card">
        <div class="result-inner">
          <div class="result-thumb-wrap">
            <img id="r-thumb" src="" alt="" loading="lazy" />
            <span class="dur-badge" id="r-dur"></span>
            <span class="cached-badge" id="r-cached" style="display:none">Cached</span>
          </div>
          <div class="result-body">
            <div class="result-title" id="r-title"></div>
            <a class="result-author" id="r-author" href="#" target="_blank" rel="noopener"></a>
            <div class="result-stats" id="r-stats"></div>
            <div class="result-desc-wrap" id="r-desc-wrap" style="display:none">
              <div class="result-desc-text" id="r-desc"></div>
              <button class="read-more" id="r-more" onclick="toggleDesc()">Read more</button>
            </div>
            <div class="dl-row" id="r-dl"></div>
          </div>
        </div>
      </div>

      <!-- JSON toggle -->
      <div class="json-toggle-row">
        <button class="json-toggle" onclick="toggleJson()">Show JSON</button>
      </div>
      <div class="json-wrap" id="json-wrap">
        <div class="copy-row">
          <button class="copy-btn" onclick="copyJson()">Copy</button>
        </div>
        <pre class="box" id="json-out"></pre>
      </div>
    </div>
  </div>

  <!-- About -->
  <div class="card about" id="about">
    <div class="card-title">ℹ️ About</div>
    <p>
      Pass any YouTube URL or plain search title to <code>/api/v1/q</code> and receive full
      video metadata — title, author, channel, thumbnail, duration, view count, full description —
      plus direct <strong>MP4 (HD)</strong> and <strong>MP3</strong> download URLs ready to use
      in bots, apps, or scripts. Results are cached for <strong>90 seconds</strong> so repeat
      requests return instantly. All responses are <strong>gzip-compressed</strong> and pretty-printed JSON.
    </p>
  </div>

  <!-- Changelog -->
  <div class="card" id="changelog">
    <div class="card-title">📋 Changelog</div>
    ${changelogHtml}
  </div>

  <!-- Disclaimer -->
  <div class="card disc" id="disclaimer">
    <div class="card-title">⚠️ Copyright Disclaimer</div>
    <p>
      This project is for <strong>educational and personal use only</strong>.
      Downloading copyrighted content may violate YouTube's Terms of Service and applicable
      copyright laws in your jurisdiction. The developer (<strong>MJL</strong>) accepts no
      responsibility for any misuse of this API. All video content, trademarks, and intellectual
      property belong to their respective owners.
    </p>
  </div>

</div>

<footer>
  <p>© 2026 <strong>MJL</strong> · YouTube Downloader API <strong>v${version}</strong></p>
  <p style="margin-top:5px;">For educational purposes only · Respect copyright laws</p>
</footer>

<script>
  let lastJson = '';
  let descExpanded = false;
  let jsonVisible = false;

  function fmtViews(n) {
    if (!n) return null;
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\\.0$/, '') + 'B views';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\\.0$/, '') + 'M views';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\\.0$/, '') + 'K views';
    return n.toLocaleString() + ' views';
  }

  function highlight(raw) {
    const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return esc(raw).replace(
      /("(?:[^"\\\\]|\\\\.)*")(\\s*:)|("(?:[^"\\\\]|\\\\.)*")|(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)|(\\btrue\\b|\\bfalse\\b|\\bnull\\b)/g,
      (_,key,colon,str,num,bool) => {
        if (key)  return '<span class="jk">' + key  + '</span>' + colon;
        if (str)  return '<span class="js">' + str  + '</span>';
        if (num)  return '<span class="jn">' + num  + '</span>';
        if (bool) return '<span class="jb">' + bool + '</span>';
        return _;
      }
    );
  }

  function show(id, visible) {
    document.getElementById(id).style.display = visible ? '' : 'none';
  }

  function toggleDesc() {
    descExpanded = !descExpanded;
    const el = document.getElementById('r-desc');
    const btn = document.getElementById('r-more');
    el.classList.toggle('expanded', descExpanded);
    btn.textContent = descExpanded ? 'Show less' : 'Read more';
  }

  function toggleJson() {
    jsonVisible = !jsonVisible;
    document.getElementById('json-wrap').style.display = jsonVisible ? '' : 'none';
    document.querySelector('.json-toggle').textContent = jsonVisible ? 'Hide JSON' : 'Show JSON';
  }

  function copyJson() {
    if (!lastJson) return;
    navigator.clipboard.writeText(lastJson).then(() => {
      const btn = document.querySelector('.copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    });
  }

  function dlIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  }

  async function run() {
    const q   = document.getElementById('q').value.trim();
    const btn = document.getElementById('search-btn');
    if (!q) return;

    // Reset UI
    btn.disabled = true;
    btn.textContent = 'Searching…';
    show('skeleton', true);
    show('result-area', false);
    show('err-box', false);
    document.getElementById('skeleton').style.display = 'flex';
    document.getElementById('json-wrap').style.display = 'none';
    jsonVisible = false;
    document.querySelector('.json-toggle').textContent = 'Show JSON';

    try {
      const res  = await fetch('/api/v1/q?=' + encodeURIComponent(q));
      const data = await res.json();
      lastJson   = JSON.stringify(data, null, 2);

      if (!res.ok || !data.success) {
        document.getElementById('err-box').innerHTML =
          '<strong>Error:</strong> ' + (data.error || 'Unknown error');
        show('err-box', true);
        show('skeleton', false);
        return;
      }

      const info  = data.info  || {};
      const media = data.media || {};

      // Thumbnail
      document.getElementById('r-thumb').src = info.thumbnail || '';
      document.getElementById('r-thumb').alt = info.title || '';

      // Duration badge
      const durEl = document.getElementById('r-dur');
      durEl.textContent = info.duration || '';
      durEl.style.display = info.duration ? '' : 'none';

      // Cached badge
      show('r-cached', !!data.cached);

      // Title
      document.getElementById('r-title').textContent = info.title || data.video_id;

      // Author
      const authorEl = document.getElementById('r-author');
      authorEl.textContent = info.author || '';
      authorEl.href = info.channel_url || '#';

      // Stats
      const stats = [];
      const views = fmtViews(info.views);
      if (views)           stats.push('<span class="stat"><span class="stat-icon">👁</span>' + views + '</span>');
      if (info.published)  stats.push('<span class="stat"><span class="stat-icon">📅</span>' + info.published + '</span>');
      document.getElementById('r-stats').innerHTML = stats.join('');

      // Description
      const descWrap = document.getElementById('r-desc-wrap');
      if (info.description) {
        document.getElementById('r-desc').textContent = info.description;
        descExpanded = false;
        document.getElementById('r-desc').classList.remove('expanded');
        document.getElementById('r-more').textContent = 'Read more';
        show('r-desc-wrap', true);
      } else {
        show('r-desc-wrap', false);
      }

      // Download buttons
      const dlRow = document.getElementById('r-dl');
      dlRow.innerHTML = '';
      if (media.mp4 && media.mp4.url) {
        const a = document.createElement('a');
        a.href = media.mp4.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'dl-btn dl-mp4';
        a.innerHTML = dlIcon() + 'Download MP4';
        dlRow.appendChild(a);
      }
      if (media.mp3 && media.mp3.url) {
        const a = document.createElement('a');
        a.href = media.mp3.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'dl-btn dl-mp3';
        a.innerHTML = dlIcon() + 'Download MP3';
        dlRow.appendChild(a);
      }

      // JSON box (pre-fill, hidden until toggled)
      document.getElementById('json-out').innerHTML = highlight(lastJson);

      show('skeleton', false);
      show('result-area', true);

    } catch (e) {
      document.getElementById('err-box').innerHTML =
        '<strong>Network error:</strong> ' + e.message;
      show('err-box', true);
      show('skeleton', false);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Search';
    }
  }

  document.getElementById('q').addEventListener('keydown', e => {
    if (e.key === 'Enter') run();
  });
</script>

</body>
</html>`;
}

router.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(buildHtml(VERSION));
});

export default router;

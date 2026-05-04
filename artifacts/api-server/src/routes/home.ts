import { Router, type IRouter } from "express";
import { VERSION } from "../lib/version";

const router: IRouter = Router();

const CHANGELOG: { version: string; date: string; tag: string; notes: string[] }[] = [
  {
    version: "1.0.3",
    date: "2026-05-04",
    tag: "current",
    notes: [
      "Endpoint cards are now interactive — click to expand & test inline",
      "Response time (ms) shown in every API response",
      "Bell notification panel for changelog",
      "Redesigned UI — cleaner layout, sticky nav, better cards",
    ],
  },
  {
    version: "1.0.2",
    date: "2026-05-03",
    tag: "",
    notes: [
      "Rich result card — thumbnail, title, author, stats, download buttons",
      "Non-skippable intro splash screen",
      "Fixed result display rendering bug",
      "Expandable description, Show JSON toggle",
    ],
  },
  {
    version: "1.0.1",
    date: "2026-05-03",
    tag: "",
    notes: [
      "Improved web UI — fully mobile & desktop responsive",
      "API output is now auto pretty-printed (2-space JSON)",
      "Gzip compression on all responses",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-05-01",
    tag: "initial",
    notes: [
      "YouTube URL and title/keyword search support",
      "MP4 HD + MP3 direct download links",
      "90-second in-memory response cache",
      "Deployable on Replit, Render, and Vercel",
    ],
  },
];

function buildHtml(version: string): string {
  const clItems = CHANGELOG.map((e) => {
    const tagHtml =
      e.tag === "current"
        ? `<span class="cl-tag current">Latest</span>`
        : e.tag === "initial"
        ? `<span class="cl-tag init">Initial</span>`
        : "";
    const notes = e.notes.map((n) => `<li>${n}</li>`).join("");
    return `<div class="cl-item">
      <div class="cl-row"><div class="cl-left"><span class="cl-ver">v${e.version}</span>${tagHtml}</div><span class="cl-date">${e.date}</span></div>
      <ul class="cl-notes">${notes}</ul>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>YouTube API — MJL</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#09090b;color:#d4d4d8;min-height:100vh;overflow-x:hidden}

    /* ── INTRO ── */
    #intro{position:fixed;inset:0;z-index:9999;background:#09090b;display:flex;align-items:center;justify-content:center;transition:opacity .65s ease}
    #intro.out{opacity:0;pointer-events:none}
    .i-box{text-align:center;animation:pop .5s cubic-bezier(.34,1.56,.64,1) both}
    @keyframes pop{from{opacity:0;transform:scale(.82) translateY(16px)}to{opacity:1;transform:none}}
    .i-icon{width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,#b91c1c,#ef4444);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 0 0 0 rgba(239,68,68,.5);animation:glow 1.8s ease-out infinite}
    @keyframes glow{0%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}70%{box-shadow:0 0 0 20px transparent}100%{box-shadow:0 0 0 0 transparent}}
    .i-icon svg{width:34px;height:34px;fill:#fff}
    .i-title{font-size:clamp(1.8rem,5vw,2.5rem);font-weight:900;color:#fff;letter-spacing:-1px}
    .i-sub{color:#52525b;font-size:.85rem;font-weight:600;margin-top:6px;letter-spacing:.3px}
    .i-bar-wrap{width:160px;height:3px;background:#27272a;border-radius:2px;margin:26px auto 0;overflow:hidden}
    .i-bar{height:100%;background:linear-gradient(90deg,#dc2626,#f87171);border-radius:2px;width:0;transition:width 2.3s cubic-bezier(.4,0,.2,1)}
    .i-ver{color:#3f3f46;font-size:.7rem;font-family:monospace;margin-top:12px;letter-spacing:.3px}

    /* ── STICKY NAV ── */
    .topbar{position:sticky;top:0;z-index:100;background:rgba(9,9,11,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid #1c1c1f;display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:52px}
    .topbar-logo{display:flex;align-items:center;gap:9px;text-decoration:none}
    .topbar-icon{width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,#b91c1c,#ef4444);display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .topbar-icon svg{width:12px;height:12px;fill:#fff}
    .topbar-name{font-weight:800;font-size:.9rem;color:#fff;letter-spacing:-.3px}
    .topbar-ver{font-size:.68rem;color:#52525b;font-family:monospace;margin-left:2px}
    .topbar-right{display:flex;align-items:center;gap:6px}
    .nav-links{display:flex;gap:2px}
    .nav-links a{color:#71717a;text-decoration:none;font-size:.78rem;font-weight:600;padding:5px 10px;border-radius:7px;transition:all .15s;white-space:nowrap}
    .nav-links a:hover{color:#e4e4e7;background:#18181b}
    @media(max-width:540px){.nav-links{display:none}}

    /* ── BELL ── */
    .bell-wrap{position:relative}
    .bell-btn{background:none;border:1px solid #27272a;border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#71717a;transition:all .15s;position:relative}
    .bell-btn:hover{background:#18181b;color:#e4e4e7;border-color:#3f3f46}
    .bell-btn svg{width:15px;height:15px}
    .bell-dot{position:absolute;top:5px;right:5px;width:7px;height:7px;background:#ef4444;border-radius:50%;border:1.5px solid #09090b}
    .bell-panel{display:none;position:absolute;top:calc(100% + 8px);right:0;width:320px;background:#18181b;border:1px solid #27272a;border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.7);z-index:200;overflow:hidden;animation:drop .18s ease}
    @keyframes drop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
    .bell-panel.open{display:block}
    .bell-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;border-bottom:1px solid #27272a}
    .bell-head-title{font-size:.78rem;font-weight:800;color:#fff;letter-spacing:.5px;text-transform:uppercase}
    .bell-close{background:none;border:none;color:#52525b;cursor:pointer;font-size:1rem;line-height:1;padding:2px 4px;border-radius:4px}
    .bell-close:hover{color:#e4e4e7}
    .bell-list{max-height:340px;overflow-y:auto;padding:10px 0}
    .cl-item{padding:12px 16px;border-bottom:1px solid #1c1c1f}
    .cl-item:last-child{border-bottom:none}
    .cl-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
    .cl-left{display:flex;align-items:center;gap:7px}
    .cl-ver{font-size:.82rem;font-weight:800;color:#fff;font-family:monospace}
    .cl-tag{font-size:.6rem;font-weight:800;padding:2px 8px;border-radius:20px;letter-spacing:.4px;text-transform:uppercase}
    .cl-tag.current{background:rgba(34,197,94,.15);color:#22c55e}
    .cl-tag.init{background:#27272a;color:#71717a}
    .cl-date{font-size:.7rem;color:#52525b}
    .cl-notes{list-style:none;display:flex;flex-direction:column;gap:4px}
    .cl-notes li{font-size:.75rem;color:#a1a1aa;padding-left:14px;position:relative;line-height:1.4}
    .cl-notes li::before{content:'·';position:absolute;left:0;color:#ef4444;font-weight:900}

    /* ── HERO ── */
    .hero{background:linear-gradient(145deg,#7f1d1d 0%,#b91c1c 40%,#ef4444 100%);padding:clamp(48px,9vw,80px) 20px clamp(36px,6vw,60px);text-align:center;position:relative;overflow:hidden}
    .hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}
    .hero-content{position:relative}
    .hero h1{font-size:clamp(2.2rem,7vw,3.6rem);font-weight:900;color:#fff;letter-spacing:-1.5px;line-height:1.05}
    .hero-sub{margin-top:12px;color:rgba(255,255,255,.75);font-size:clamp(.88rem,2.2vw,1rem)}
    .hero-badges{display:flex;gap:8px;justify-content:center;margin-top:20px;flex-wrap:wrap}
    .hbadge{background:rgba(255,255,255,.12);backdrop-filter:blur(6px);color:rgba(255,255,255,.9);padding:5px 14px;border-radius:20px;font-size:.72rem;font-weight:700;letter-spacing:.5px;border:1px solid rgba(255,255,255,.15)}

    /* ── LAYOUT ── */
    .wrap{max-width:820px;margin:0 auto;padding:clamp(24px,4vw,40px) 16px 72px}

    /* ── SECTION LABEL ── */
    .sec-label{font-size:.68rem;font-weight:800;color:#52525b;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;padding-left:2px}

    /* ── ENDPOINT ACCORDION ── */
    .ep-list{display:flex;flex-direction:column;gap:8px;margin-bottom:28px}
    .ep-card{background:#111113;border:1px solid #27272a;border-radius:12px;overflow:hidden;transition:border-color .2s}
    .ep-card.open{border-color:#3f3f46}
    .ep-header{display:flex;align-items:center;gap:10px;padding:13px 16px;cursor:pointer;user-select:none;transition:background .15s}
    .ep-header:hover{background:rgba(255,255,255,.03)}
    .ep-method{font-size:.65rem;font-weight:900;padding:3px 8px;border-radius:5px;background:#16a34a;color:#fff;letter-spacing:.4px;flex-shrink:0}
    .ep-path{font-family:'Menlo','Consolas',monospace;font-size:.82rem;color:#60a5fa;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ep-desc-label{font-size:.73rem;color:#52525b;white-space:nowrap;margin-right:6px}
    @media(max-width:480px){.ep-desc-label{display:none}}
    .ep-chevron{color:#3f3f46;flex-shrink:0;transition:transform .2s}
    .ep-chevron svg{width:14px;height:14px}
    .ep-card.open .ep-chevron{transform:rotate(180deg)}

    .ep-body{display:none;border-top:1px solid #1c1c1f;padding:16px}
    .ep-card.open .ep-body{display:block}
    .ep-info{font-size:.8rem;color:#71717a;line-height:1.6;margin-bottom:14px}
    .ep-info code{background:#27272a;color:#e4e4e7;padding:1px 5px;border-radius:4px;font-size:.85em}

    .ep-input-row{display:flex;gap:8px;margin-bottom:12px}
    .ep-input{flex:1;min-width:0;background:#09090b;border:1px solid #3f3f46;border-radius:8px;color:#e4e4e7;padding:10px 14px;font-size:.85rem;outline:none;transition:border-color .18s,box-shadow .18s;font-family:inherit}
    .ep-input:focus{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.12)}
    .ep-input::placeholder{color:#3f3f46}
    .ep-fetch-btn{background:#ef4444;color:#fff;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;font-size:.82rem;font-weight:700;transition:background .15s,transform .1s;white-space:nowrap;display:flex;align-items:center;gap:6px}
    .ep-fetch-btn:hover:not(:disabled){background:#dc2626;transform:translateY(-1px)}
    .ep-fetch-btn:disabled{background:#27272a;color:#52525b;cursor:not-allowed;transform:none}
    .ep-fetch-btn svg{width:13px;height:13px}
    @media(max-width:440px){.ep-input-row{flex-direction:column}}

    /* ── EP RESULT ── */
    .ep-result{display:none;margin-top:4px}
    .ep-result-meta{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap}
    .ep-status{font-size:.7rem;font-weight:800;padding:2px 8px;border-radius:5px;letter-spacing:.3px}
    .ep-status.ok{background:rgba(34,197,94,.15);color:#22c55e}
    .ep-status.err{background:rgba(239,68,68,.12);color:#f87171}
    .ep-ms{font-size:.7rem;color:#52525b;font-family:monospace}
    .ep-cached{font-size:.7rem;color:#f59e0b;background:rgba(245,158,11,.1);padding:2px 7px;border-radius:4px;font-weight:700}

    /* ── RICH RESULT CARD (inside endpoint 1) ── */
    .r-card{background:#09090b;border:1px solid #27272a;border-radius:10px;overflow:hidden;margin-bottom:10px;animation:slide-up .25s ease}
    @keyframes slide-up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    .r-inner{display:grid;grid-template-columns:180px 1fr}
    @media(max-width:540px){.r-inner{grid-template-columns:1fr}}
    .r-thumb{position:relative;background:#111;min-height:115px}
    .r-thumb img{width:100%;height:100%;object-fit:cover;display:block}
    .r-dur{position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,.85);color:#fff;font-size:.66rem;font-weight:700;padding:1px 6px;border-radius:4px;font-family:monospace}
    .r-cached-badge{display:none;position:absolute;top:6px;left:6px;background:rgba(34,197,94,.18);color:#22c55e;font-size:.6rem;font-weight:800;padding:2px 6px;border-radius:4px;letter-spacing:.4px;text-transform:uppercase}
    .r-body{padding:14px 16px;display:flex;flex-direction:column;gap:8px;min-width:0}
    .r-title{font-size:.92rem;font-weight:700;color:#fff;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .r-author{font-size:.76rem;color:#60a5fa;text-decoration:none;font-weight:600}
    .r-author:hover{color:#93c5fd}
    .r-stats{display:flex;flex-wrap:wrap;gap:4px 12px}
    .r-stat{font-size:.72rem;color:#71717a;display:flex;align-items:center;gap:4px}
    .r-desc-wrap{font-size:.76rem;color:#a1a1aa;line-height:1.55;display:none}
    .r-desc-text{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-line}
    .r-desc-text.exp{-webkit-line-clamp:unset}
    .r-more{background:none;border:none;color:#ef4444;font-size:.72rem;font-weight:700;cursor:pointer;padding:2px 0;margin-top:3px;display:block}
    .r-more:hover{color:#fca5a5}
    .r-dl{display:flex;gap:8px;flex-wrap:wrap;margin-top:2px}
    .dl-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:8px;font-size:.78rem;font-weight:700;text-decoration:none;transition:all .15s;border:1px solid transparent}
    .dl-mp4{background:rgba(239,68,68,.12);color:#f87171;border-color:rgba(239,68,68,.25)}
    .dl-mp4:hover{background:rgba(239,68,68,.22);color:#fca5a5}
    .dl-mp3{background:rgba(96,165,250,.1);color:#60a5fa;border-color:rgba(96,165,250,.22)}
    .dl-mp3:hover{background:rgba(96,165,250,.2);color:#93c5fd}
    .dl-btn svg{width:12px;height:12px;flex-shrink:0}

    /* ── SKELETON ── */
    .ep-skel{display:none;flex-direction:column;gap:10px;padding:10px 0}
    .skel-line{background:linear-gradient(90deg,#1c1c1f 25%,#27272a 50%,#1c1c1f 75%);background-size:200% 100%;animation:shim 1.2s infinite;border-radius:5px;height:12px}
    @keyframes shim{0%{background-position:200% 0}100%{background-position:-200% 0}}

    /* ── JSON BOX ── */
    .json-actions{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
    .json-label{font-size:.68rem;font-weight:700;color:#52525b;text-transform:uppercase;letter-spacing:.5px}
    .copy-btn{background:#27272a;color:#a1a1aa;border:1px solid #3f3f46;border-radius:5px;padding:3px 9px;font-size:.68rem;cursor:pointer;font-weight:700;transition:all .15s}
    .copy-btn:hover{background:#3f3f46;color:#fff}
    pre.jbox{background:#050507;border:1px solid #1c1c1f;border-radius:8px;padding:14px;font-family:'Menlo','Consolas',monospace;font-size:.74rem;line-height:1.65;overflow:auto;white-space:pre-wrap;word-break:break-all;max-height:360px;margin:0}
    .jk{color:#f87171}.js{color:#86efac}.jn{color:#fbbf24}.jb{color:#818cf8}

    /* ── MISC CARDS ── */
    .card{background:#111113;border:1px solid #27272a;border-radius:14px;padding:clamp(18px,3.5vw,26px);margin-bottom:24px}
    .card-title{font-size:.72rem;font-weight:800;color:#71717a;text-transform:uppercase;letter-spacing:.8px;margin-bottom:14px}
    .about p{color:#a1a1aa;line-height:1.8;font-size:.9rem}
    .about code{background:#27272a;color:#e4e4e7;padding:1px 5px;border-radius:4px;font-size:.88em;font-family:monospace}
    .about strong{color:#e4e4e7}
    .disc p{color:#a1a1aa;line-height:1.8;font-size:.88rem}
    .disc strong{color:#fbbf24}
    footer{text-align:center;padding:28px 20px;color:#3f3f46;font-size:.75rem;border-top:1px solid #18181b}
    footer strong{color:#52525b}
  </style>
</head>
<body>

<!-- INTRO -->
<div id="intro">
  <div class="i-box">
    <div class="i-icon"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
    <div class="i-title">YouTube API</div>
    <div class="i-sub">by MJL</div>
    <div class="i-bar-wrap"><div class="i-bar" id="ibar"></div></div>
    <div class="i-ver">v${version}</div>
  </div>
</div>

<!-- STICKY TOPBAR -->
<nav class="topbar">
  <a class="topbar-logo" href="#">
    <div class="topbar-icon"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
    <span class="topbar-name">YouTube API</span>
    <span class="topbar-ver">v${version}</span>
  </a>
  <div class="topbar-right">
    <div class="nav-links">
      <a href="#endpoints">Endpoints</a>
      <a href="#about">About</a>
      <a href="#disclaimer">Disclaimer</a>
    </div>
    <!-- Bell changelog -->
    <div class="bell-wrap">
      <button class="bell-btn" id="bell-btn" onclick="toggleBell()" title="Changelog">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="bell-dot" id="bell-dot"></span>
      </button>
      <div class="bell-panel" id="bell-panel">
        <div class="bell-head">
          <span class="bell-head-title">Changelog</span>
          <button class="bell-close" onclick="toggleBell()">✕</button>
        </div>
        <div class="bell-list">${clItems}</div>
      </div>
    </div>
  </div>
</nav>

<!-- HERO -->
<div class="hero">
  <div class="hero-content">
    <h1>YouTube API</h1>
    <div class="hero-sub">Real-time metadata · MP4 HD &amp; MP3 download links</div>
    <div class="hero-badges">
      <span class="hbadge">v${version}</span>
      <span class="hbadge">by MJL</span>
      <span class="hbadge">YouTube Only</span>
    </div>
  </div>
</div>

<div class="wrap">

  <!-- ENDPOINTS -->
  <div class="sec-label" id="endpoints">⚡ Endpoints — click to expand &amp; try</div>
  <div class="ep-list">

    <!-- /api/v1/q -->
    <div class="ep-card" id="ep0">
      <div class="ep-header" onclick="toggleEp(0)">
        <span class="ep-method">GET</span>
        <span class="ep-path">/api/v1/q?=(url or title)</span>
        <span class="ep-desc-label">Video info + download links</span>
        <span class="ep-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></span>
      </div>
      <div class="ep-body">
        <p class="ep-info">Pass any YouTube <code>URL</code> or a plain search title. Returns full metadata — title, author, thumbnail, duration, views — plus direct <code>MP4</code> and <code>MP3</code> download links. Results cached for <strong style="color:#e4e4e7">90 seconds</strong>.</p>
        <div class="ep-input-row">
          <input class="ep-input" id="q0" type="text" placeholder="e.g.  bohemian rhapsody  or  https://youtu.be/…" onkeydown="if(event.key==='Enter')fetchEp(0)"/>
          <button class="ep-fetch-btn" id="btn0" onclick="fetchEp(0)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Search
          </button>
        </div>
        <div class="ep-skel" id="skel0">
          <div class="skel-line" style="width:55%;height:15px"></div>
          <div class="skel-line" style="width:30%"></div>
          <div class="skel-line" style="width:75%"></div>
          <div class="skel-line" style="width:70%"></div>
          <div class="skel-line" style="width:42%;height:30px;border-radius:8px;margin-top:2px"></div>
        </div>
        <div class="ep-result" id="res0">
          <div class="ep-result-meta">
            <span class="ep-status" id="stat0"></span>
            <span class="ep-ms" id="ms0"></span>
            <span class="ep-cached" id="cac0" style="display:none">⚡ Cached</span>
          </div>
          <!-- Rich card for /v1/q -->
          <div class="r-card" id="rcard0" style="display:none">
            <div class="r-inner">
              <div class="r-thumb">
                <img id="r-thumb" src="" alt="" loading="lazy"/>
                <span class="r-dur" id="r-dur" style="display:none"></span>
                <span class="r-cached-badge" id="r-cached-b"></span>
              </div>
              <div class="r-body">
                <div class="r-title" id="r-title"></div>
                <a class="r-author" id="r-author" href="#" target="_blank" rel="noopener"></a>
                <div class="r-stats" id="r-stats"></div>
                <div class="r-desc-wrap" id="r-desc-wrap">
                  <div class="r-desc-text" id="r-desc"></div>
                  <button class="r-more" id="r-more" onclick="toggleDesc()">Read more</button>
                </div>
                <div class="r-dl" id="r-dl"></div>
              </div>
            </div>
          </div>
          <!-- Raw JSON -->
          <div class="json-actions">
            <span class="json-label">Response</span>
            <button class="copy-btn" onclick="copyRaw(0)">Copy</button>
          </div>
          <pre class="jbox" id="raw0"></pre>
        </div>
      </div>
    </div>

    <!-- /api/uptime -->
    <div class="ep-card" id="ep1">
      <div class="ep-header" onclick="toggleEp(1)">
        <span class="ep-method">GET</span>
        <span class="ep-path">/api/uptime</span>
        <span class="ep-desc-label">Server uptime &amp; status</span>
        <span class="ep-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></span>
      </div>
      <div class="ep-body">
        <p class="ep-info">Returns the server uptime in seconds plus a status string. Useful for monitoring or health dashboards.</p>
        <div class="ep-input-row">
          <button class="ep-fetch-btn" id="btn1" onclick="fetchEp(1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Fetch
          </button>
        </div>
        <div class="ep-skel" id="skel1">
          <div class="skel-line" style="width:60%"></div>
          <div class="skel-line" style="width:40%"></div>
        </div>
        <div class="ep-result" id="res1">
          <div class="ep-result-meta">
            <span class="ep-status" id="stat1"></span>
            <span class="ep-ms" id="ms1"></span>
          </div>
          <div class="json-actions">
            <span class="json-label">Response</span>
            <button class="copy-btn" onclick="copyRaw(1)">Copy</button>
          </div>
          <pre class="jbox" id="raw1"></pre>
        </div>
      </div>
    </div>

    <!-- /api/healthz -->
    <div class="ep-card" id="ep2">
      <div class="ep-header" onclick="toggleEp(2)">
        <span class="ep-method">GET</span>
        <span class="ep-path">/api/healthz</span>
        <span class="ep-desc-label">Health check</span>
        <span class="ep-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></span>
      </div>
      <div class="ep-body">
        <p class="ep-info">Simple liveness probe. Returns <code>ok</code> when the server is healthy. Used by Render, Replit, and Vercel health checks.</p>
        <div class="ep-input-row">
          <button class="ep-fetch-btn" id="btn2" onclick="fetchEp(2)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Fetch
          </button>
        </div>
        <div class="ep-skel" id="skel2">
          <div class="skel-line" style="width:40%"></div>
        </div>
        <div class="ep-result" id="res2">
          <div class="ep-result-meta">
            <span class="ep-status" id="stat2"></span>
            <span class="ep-ms" id="ms2"></span>
          </div>
          <div class="json-actions">
            <span class="json-label">Response</span>
            <button class="copy-btn" onclick="copyRaw(2)">Copy</button>
          </div>
          <pre class="jbox" id="raw2"></pre>
        </div>
      </div>
    </div>

  </div><!-- /ep-list -->

  <!-- ABOUT -->
  <div class="card about" id="about">
    <div class="card-title">About</div>
    <p>Pass any YouTube URL or plain search title to <code>/api/v1/q</code> and receive full
    video metadata plus direct <strong>MP4 HD</strong> and <strong>MP3</strong> download URLs
    ready to use in bots, apps, or scripts. Results are cached for <strong>90 seconds</strong>.
    All responses include a <strong>ms</strong> field showing how fast the fetch took.</p>
  </div>

  <!-- DISCLAIMER -->
  <div class="card disc" id="disclaimer">
    <div class="card-title">Copyright Disclaimer</div>
    <p>This project is for <strong>educational and personal use only</strong>.
    Downloading copyrighted content may violate YouTube's Terms of Service and applicable
    copyright laws in your jurisdiction. The developer (<strong>MJL</strong>) accepts no
    responsibility for any misuse. All content belongs to respective owners.</p>
  </div>

</div>

<footer>
  <p>© 2026 <strong>MJL</strong> · YouTube API <strong>v${version}</strong> · For educational purposes only</p>
</footer>

<script>
/* ── INTRO ── */
(function(){
  var bar=document.getElementById('ibar'),intro=document.getElementById('intro');
  requestAnimationFrame(function(){requestAnimationFrame(function(){bar.style.width='100%';});});
  setTimeout(function(){
    intro.classList.add('out');
    setTimeout(function(){intro.style.display='none';},700);
  },2600);
})();

/* ── BELL ── */
function toggleBell(){
  var p=document.getElementById('bell-panel');
  p.classList.toggle('open');
  if(p.classList.contains('open')){
    document.getElementById('bell-dot').style.display='none';
    document.addEventListener('click',closeBellOutside,true);
  } else {
    document.removeEventListener('click',closeBellOutside,true);
  }
}
function closeBellOutside(e){
  var wrap=document.querySelector('.bell-wrap');
  if(!wrap.contains(e.target)){
    document.getElementById('bell-panel').classList.remove('open');
    document.removeEventListener('click',closeBellOutside,true);
  }
}

/* ── ACCORDION ── */
function toggleEp(n){
  var card=document.getElementById('ep'+n);
  card.classList.toggle('open');
}

/* ── STATE ── */
var rawStore=['','',''];
var descExpanded=false;

/* ── UTILS ── */
function sv(id,vis,t){document.getElementById(id).style.display=vis?(t||'block'):'none';}

function fmtViews(n){
  if(!n)return null;
  if(n>=1e9)return(n/1e9).toFixed(1).replace(/\\.0$/,'')+'B views';
  if(n>=1e6)return(n/1e6).toFixed(1).replace(/\\.0$/,'')+'M views';
  if(n>=1e3)return(n/1e3).toFixed(1).replace(/\\.0$/,'')+'K views';
  return n.toLocaleString()+' views';
}

function hl(raw){
  var esc=function(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
  return esc(raw).replace(
    /("(?:[^"\\\\]|\\\\.)*")(\\s*:)|("(?:[^"\\\\]|\\\\.)*")|(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)|(\\btrue\\b|\\bfalse\\b|\\bnull\\b)/g,
    function(_,key,col,str,num,bool){
      if(key)return'<span class="jk">'+key+'</span>'+col;
      if(str)return'<span class="js">'+str+'</span>';
      if(num)return'<span class="jn">'+num+'</span>';
      if(bool)return'<span class="jb">'+bool+'</span>';
      return _;
    }
  );
}

function dlIcon(){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
}

function copyRaw(n){
  if(!rawStore[n])return;
  navigator.clipboard.writeText(rawStore[n]).then(function(){
    var btns=document.querySelectorAll('#res'+n+' .copy-btn');
    btns.forEach(function(b){b.textContent='Copied!';});
    setTimeout(function(){btns.forEach(function(b){b.textContent='Copy';});},1500);
  });
}

function toggleDesc(){
  descExpanded=!descExpanded;
  document.getElementById('r-desc').classList.toggle('exp',descExpanded);
  document.getElementById('r-more').textContent=descExpanded?'Show less':'Read more';
}

/* ── ENDPOINT URLS ── */
var EP_PATHS=['/api/v1/q','  /api/uptime','/api/healthz'];

async function fetchEp(n){
  var btn=document.getElementById('btn'+n);
  btn.disabled=true;
  btn.textContent=n===0?'Searching\u2026':'Fetching\u2026';

  sv('skel'+n,true,'flex');
  sv('res'+n,false,'block');
  if(n===0){sv('rcard0',false,'block');}

  var url;
  if(n===0){
    var q=document.getElementById('q0').value.trim();
    if(!q){btn.disabled=false;btn.innerHTML=(n===0?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Fetch');sv('skel'+n,false,'flex');return;}
    url='/api/v1/q?='+encodeURIComponent(q);
  } else if(n===1){
    url='/api/uptime';
  } else {
    url='/api/healthz';
  }

  var t0=Date.now();
  try{
    var resp=await fetch(url);
    var clientMs=Date.now()-t0;
    var text=await resp.text();
    var data;
    try{data=JSON.parse(text);}catch(e){data=text;}
    rawStore[n]=typeof data==='string'?data:JSON.stringify(data,null,2);

    sv('skel'+n,false,'flex');

    // Status badge
    var statEl=document.getElementById('stat'+n);
    statEl.textContent=resp.ok?'200 OK':resp.status+' Error';
    statEl.className='ep-status '+(resp.ok?'ok':'err');

    // Timing — prefer server ms field if available
    var serverMs=typeof data==='object'&&data&&typeof data.ms==='number'?data.ms:null;
    document.getElementById('ms'+n).textContent=serverMs!==null?(serverMs+'ms (server)'):(clientMs+'ms');

    // Cached badge (only ep0)
    if(n===0&&document.getElementById('cac0')){
      sv('cac0',(typeof data==='object'&&data&&data.cached)?true:false,'inline-block');
    }

    // Raw JSON
    document.getElementById('raw'+n).innerHTML=typeof data==='string'?data:hl(rawStore[n]);
    sv('res'+n,true,'block');

    // Rich card for ep0
    if(n===0&&typeof data==='object'&&data&&data.success){
      var info=data.info||{};
      var media=data.media||{};

      document.getElementById('r-thumb').src=info.thumbnail||'';
      document.getElementById('r-thumb').alt=info.title||'';

      var durEl=document.getElementById('r-dur');
      durEl.textContent=info.duration||'';
      durEl.style.display=info.duration?'inline-block':'none';

      var cbEl=document.getElementById('r-cached-b');
      cbEl.textContent='Cached';
      cbEl.style.display=data.cached?'inline-block':'none';

      document.getElementById('r-title').textContent=info.title||data.video_id||'';
      var aEl=document.getElementById('r-author');
      aEl.textContent=info.author||'';
      aEl.href=info.channel_url||'#';

      var stats=[];
      var v=fmtViews(info.views);
      if(v) stats.push('<span class="r-stat">👁 '+v+'</span>');
      if(info.published) stats.push('<span class="r-stat">📅 '+info.published+'</span>');
      document.getElementById('r-stats').innerHTML=stats.join('');

      if(info.description){
        document.getElementById('r-desc').textContent=info.description;
        descExpanded=false;
        document.getElementById('r-desc').classList.remove('exp');
        document.getElementById('r-more').textContent='Read more';
        sv('r-desc-wrap',true,'block');
      } else {
        sv('r-desc-wrap',false,'block');
      }

      var dlRow=document.getElementById('r-dl');
      dlRow.innerHTML='';
      if(media.mp4&&media.mp4.url){
        var a4=document.createElement('a');
        a4.href=media.mp4.url;a4.target='_blank';a4.rel='noopener noreferrer';
        a4.className='dl-btn dl-mp4';a4.innerHTML=dlIcon()+'Download MP4';
        dlRow.appendChild(a4);
      }
      if(media.mp3&&media.mp3.url){
        var a3=document.createElement('a');
        a3.href=media.mp3.url;a3.target='_blank';a3.rel='noopener noreferrer';
        a3.className='dl-btn dl-mp3';a3.innerHTML=dlIcon()+'Download MP3';
        dlRow.appendChild(a3);
      }

      sv('rcard0',true,'block');
    }

  }catch(e){
    sv('skel'+n,false,'flex');
    rawStore[n]='Network error: '+e.message;
    document.getElementById('raw'+n).textContent=rawStore[n];
    var se=document.getElementById('stat'+n);
    se.textContent='Error';se.className='ep-status err';
    document.getElementById('ms'+n).textContent='—';
    sv('res'+n,true,'block');
  }finally{
    btn.disabled=false;
    if(n===0){
      btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search';
    } else {
      btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Fetch';
    }
  }
}
</script>

</body>
</html>`;
}

router.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(buildHtml(VERSION));
});

export default router;

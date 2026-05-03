import { Router, type IRouter } from "express";
import { VERSION } from "../lib/version";

const router: IRouter = Router();

const CHANGELOG: { version: string; date: string; tag: string; notes: string[] }[] = [
  {
    version: "1.0.1",
    date: "2026-05-03",
    tag: "current",
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
        : `<span class="cl-tag">Initial</span>`;
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
           background: #0d0d0f; color: #d4d4d8; min-height: 100vh; font-size: 16px; }

    /* ── HERO ───────────────────────────────────────────── */
    .hero { background: linear-gradient(140deg, #900 0%, #e00 50%, #ff4444 100%);
            padding: clamp(40px,8vw,72px) 20px clamp(32px,6vw,56px); text-align: center; }
    .hero h1 { font-size: clamp(2rem, 6vw, 3.2rem); font-weight: 900; color: #fff;
               letter-spacing: -1px; line-height: 1.1; }
    .hero p  { margin-top: 10px; color: rgba(255,255,255,.82); font-size: clamp(.9rem,2.5vw,1.05rem); }
    .badges  { display: flex; gap: 8px; justify-content: center; margin-top: 16px; flex-wrap: wrap; }
    .badge   { background: rgba(255,255,255,.18); backdrop-filter: blur(4px);
               color: #fff; padding: 5px 14px; border-radius: 20px;
               font-size: .76rem; font-weight: 700; letter-spacing: .4px; }

    /* ── NAV PILLS ──────────────────────────────────────── */
    .nav { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;
           padding: 18px 20px; border-bottom: 1px solid #1f1f23; }
    .nav a { color: #a1a1aa; text-decoration: none; font-size: .82rem; font-weight: 600;
             padding: 6px 14px; border-radius: 20px; border: 1px solid #27272a;
             transition: all .15s; }
    .nav a:hover { color: #fff; border-color: #52525b; background: #18181b; }

    /* ── LAYOUT ─────────────────────────────────────────── */
    .wrap { max-width: 860px; margin: 0 auto; padding: clamp(24px,4vw,44px) 16px 64px; }

    /* ── CARDS ──────────────────────────────────────────── */
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 16px;
            padding: clamp(18px,4vw,28px); margin-bottom: 20px; }
    .card-title { font-size: .82rem; font-weight: 800; color: #fff; text-transform: uppercase;
                  letter-spacing: .8px; margin-bottom: 16px;
                  display: flex; align-items: center; gap: 8px; }

    /* ── ENDPOINTS ──────────────────────────────────────── */
    .ep { display: grid; grid-template-columns: auto 1fr auto;
          align-items: center; gap: 10px;
          background: #0d0d0f; border: 1px solid #27272a;
          border-radius: 10px; padding: 10px 14px; margin-bottom: 8px;
          font-family: 'Menlo','Consolas',monospace; font-size: .84rem; }
    .ep:last-child { margin-bottom: 0; }
    .get      { background: #22c55e; color: #000; padding: 3px 9px; border-radius: 5px;
                font-size: .7rem; font-weight: 900; text-align: center; white-space: nowrap; }
    .ep-path  { color: #60a5fa; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ep-desc  { color: #52525b; font-family: sans-serif; font-size: .75rem;
                text-align: right; white-space: nowrap; }
    @media (max-width: 520px) {
      .ep { grid-template-columns: auto 1fr; }
      .ep-desc { display: none; }
    }

    /* ── TESTER ─────────────────────────────────────────── */
    .tester-row { display: flex; gap: 10px; }
    .tester-input { flex: 1; min-width: 0; background: #0d0d0f; border: 1px solid #3f3f46;
                    border-radius: 10px; color: #e4e4e7; padding: 13px 16px;
                    font-size: .93rem; outline: none; transition: border-color .2s; }
    .tester-input:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.15); }
    .tester-input::placeholder { color: #52525b; }
    .btn { background: #ef4444; color: #fff; border: none; padding: 13px 22px;
           border-radius: 10px; cursor: pointer; font-size: .93rem; font-weight: 700;
           transition: background .15s, transform .1s; white-space: nowrap; }
    .btn:hover:not(:disabled) { background: #dc2626; transform: translateY(-1px); }
    .btn:active:not(:disabled) { transform: translateY(0); }
    .btn:disabled { background: #3f3f46; color: #71717a; cursor: not-allowed; }
    @media (max-width: 480px) {
      .tester-row { flex-direction: column; }
      .btn { width: 100%; }
    }
    .res-wrap { position: relative; margin-top: 14px; }
    .copy-btn { position: absolute; top: 10px; right: 10px; background: #27272a;
                color: #a1a1aa; border: 1px solid #3f3f46; border-radius: 6px;
                padding: 4px 10px; font-size: .72rem; cursor: pointer; font-weight: 600;
                transition: all .15s; z-index: 1; }
    .copy-btn:hover { background: #3f3f46; color: #fff; }
    pre.box { background: #0a0a0c; border: 1px solid #27272a; border-radius: 10px;
              padding: 16px; font-family: 'Menlo','Consolas',monospace; font-size: .78rem;
              line-height: 1.65; overflow: auto; white-space: pre-wrap; word-break: break-all;
              min-height: 56px; max-height: 440px; tab-size: 2; }
    pre.box.empty  { color: #3f3f46; }
    pre.box.loading { color: #71717a; }
    /* syntax colours */
    .jk { color: #f87171; }   /* key   */
    .js { color: #86efac; }   /* string value */
    .jn { color: #fbbf24; }   /* number */
    .jb { color: #818cf8; }   /* bool/null */
    .je { color: #fca5a5; }   /* error */

    /* ── ABOUT ──────────────────────────────────────────── */
    .about p { color: #a1a1aa; line-height: 1.8; font-size: .95rem; }
    .about code { background: #27272a; color: #e4e4e7; padding: 1px 6px;
                  border-radius: 4px; font-size: .88em; font-family: monospace; }
    .about strong { color: #e4e4e7; }

    /* ── CHANGELOG ──────────────────────────────────────── */
    .cl-entry { padding: 18px 0; border-bottom: 1px solid #27272a; }
    .cl-entry:last-child { border-bottom: none; padding-bottom: 0; }
    .cl-entry:first-child { padding-top: 0; }
    .cl-header { display: flex; align-items: center; justify-content: space-between;
                 flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .cl-left   { display: flex; align-items: center; gap: 10px; }
    .cl-ver    { font-size: 1rem; font-weight: 800; color: #fff; font-family: monospace; }
    .cl-tag    { font-size: .7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px;
                 background: #27272a; color: #71717a; letter-spacing: .4px; }
    .cl-tag.current { background: rgba(34,197,94,.15); color: #22c55e; }
    .cl-date   { font-size: .78rem; color: #52525b; }
    .cl-list   { list-style: none; display: flex; flex-direction: column; gap: 6px; }
    .cl-list li { color: #a1a1aa; font-size: .88rem; padding-left: 18px; position: relative; line-height: 1.5; }
    .cl-list li::before { content: '→'; position: absolute; left: 0; color: #ef4444; font-weight: 700; }

    /* ── DISCLAIMER ─────────────────────────────────────── */
    .disc p { color: #a1a1aa; line-height: 1.8; font-size: .92rem; }
    .disc strong { color: #fbbf24; }

    /* ── FOOTER ─────────────────────────────────────────── */
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
  <a href="#tester">Live Tester</a>
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
    <div class="card-title">🔬 Live Tester</div>
    <div class="tester-row">
      <input class="tester-input" id="q" type="text"
             placeholder="YouTube URL or title — e.g. never gonna give you up" />
      <button class="btn" id="btn" onclick="run()">Search</button>
    </div>
    <div class="res-wrap">
      <button class="copy-btn" id="copy" onclick="copyOut()" style="display:none">Copy</button>
      <pre class="box empty" id="out">Response will appear here...</pre>
    </div>
  </div>

  <!-- About -->
  <div class="card about" id="about">
    <div class="card-title">ℹ️ About</div>
    <p>
      Pass any YouTube URL or plain search title to <code>/api/v1/q</code> and receive full
      video metadata — title, author, channel, thumbnail, duration, view count, full description —
      plus direct <strong>MP4 (HD)</strong> and <strong>MP3</strong> download URLs ready to use
      in bots, apps, or scripts. Results are cached for <strong>90 seconds</strong>
      so repeat requests return instantly. All responses are <strong>gzip-compressed</strong>
      and pretty-printed JSON.
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
  // Syntax-highlight a JSON string into safe HTML
  function highlight(raw) {
    const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return esc(raw).replace(
      /("(?:[^"\\\\]|\\\\.)*")(\s*:)|("(?:[^"\\\\]|\\\\.)*")|(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)|(\\btrue\\b|\\bfalse\\b|\\bnull\\b)/g,
      (_,key,colon,str,num,bool) => {
        if (key)  return '<span class="jk">' + key + '</span>' + colon;
        if (str)  return '<span class="js">' + str + '</span>';
        if (num)  return '<span class="jn">' + num + '</span>';
        if (bool) return '<span class="jb">' + bool + '</span>';
        return _;
      }
    );
  }

  let lastJson = '';

  async function run() {
    const q   = document.getElementById('q').value.trim();
    const btn = document.getElementById('btn');
    const out = document.getElementById('out');
    const copy = document.getElementById('copy');
    if (!q) return;
    btn.disabled = true;
    btn.textContent = 'Loading…';
    out.className = 'box loading';
    out.innerHTML = 'Fetching…';
    copy.style.display = 'none';
    try {
      const res  = await fetch('/api/v1/q?=' + encodeURIComponent(q));
      const data = await res.json();
      lastJson = JSON.stringify(data, null, 2);
      out.className = 'box' + (res.ok ? '' : ' err');
      out.innerHTML = highlight(lastJson);
      copy.style.display = '';
    } catch (e) {
      out.innerHTML = '<span class="je">Network error: ' + e.message + '</span>';
      out.className = 'box';
      lastJson = '';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Search';
    }
  }

  function copyOut() {
    if (!lastJson) return;
    navigator.clipboard.writeText(lastJson).then(() => {
      const btn = document.getElementById('copy');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    });
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

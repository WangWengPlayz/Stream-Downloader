import { Router, type IRouter } from "express";
import { VERSION } from "../lib/version";

const router: IRouter = Router();

function buildHtml(version: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>YouTube API — MJL</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d0d0f; color: #d4d4d8; min-height: 100vh; }

    /* HEADER */
    .hero { background: linear-gradient(135deg, #c00 0%, #ff2222 60%, #ff6060 100%); padding: 64px 24px 48px; text-align: center; }
    .hero h1 { font-size: clamp(1.8rem, 5vw, 3rem); font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .hero p  { margin-top: 10px; color: rgba(255,255,255,0.85); font-size: 1.05rem; }
    .badges  { display: flex; gap: 8px; justify-content: center; margin-top: 18px; flex-wrap: wrap; }
    .badge   { background: rgba(255,255,255,0.18); color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.3px; }

    /* LAYOUT */
    .wrap { max-width: 820px; margin: 0 auto; padding: 40px 20px 60px; }

    /* CARDS */
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 14px; padding: 26px; margin-bottom: 22px; }
    .card-title { font-size: 0.95rem; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
    .card-title span { font-size: 1.1em; }

    /* ENDPOINTS */
    .ep { display: flex; align-items: center; gap: 12px; background: #0d0d0f; border: 1px solid #27272a; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; font-family: 'Menlo', 'Consolas', monospace; font-size: 0.87rem; flex-wrap: wrap; gap: 8px; }
    .ep:last-child { margin-bottom: 0; }
    .get  { background: #22c55e; color: #000; padding: 2px 8px; border-radius: 5px; font-size: 0.72rem; font-weight: 800; min-width: 36px; text-align: center; }
    .ep-path { color: #60a5fa; }
    .ep-desc { color: #71717a; font-family: sans-serif; font-size: 0.8rem; margin-left: auto; }

    /* TESTER */
    .row   { display: flex; gap: 10px; }
    input  { flex: 1; background: #0d0d0f; border: 1px solid #3f3f46; border-radius: 9px; color: #e4e4e7; padding: 12px 16px; font-size: 0.93rem; outline: none; transition: border-color .2s; }
    input:focus { border-color: #ef4444; }
    .btn   { background: #ef4444; color: #fff; border: none; padding: 12px 22px; border-radius: 9px; cursor: pointer; font-size: 0.93rem; font-weight: 700; transition: background .15s; white-space: nowrap; }
    .btn:hover    { background: #dc2626; }
    .btn:disabled { background: #3f3f46; color: #71717a; cursor: not-allowed; }
    pre.box { margin-top: 14px; background: #0d0d0f; border: 1px solid #27272a; border-radius: 9px; padding: 16px; font-family: 'Menlo', 'Consolas', monospace; font-size: 0.8rem; color: #86efac; overflow: auto; white-space: pre-wrap; word-break: break-all; min-height: 54px; max-height: 420px; }
    pre.box.err   { color: #fca5a5; }
    pre.box.empty { color: #3f3f46; }

    /* ABOUT */
    .about p { color: #a1a1aa; line-height: 1.75; }

    /* DISCLAIMER */
    .disc p { color: #a1a1aa; line-height: 1.75; }
    .disc strong { color: #fbbf24; }

    /* FOOTER */
    footer { text-align: center; padding: 32px 20px; color: #3f3f46; font-size: 0.82rem; border-top: 1px solid #18181b; }
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

<div class="wrap">

  <!-- Endpoints -->
  <div class="card">
    <div class="card-title"><span>⚡</span> Endpoints</div>
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
  <div class="card">
    <div class="card-title"><span>🔬</span> Live Tester</div>
    <div class="row">
      <input id="q" type="text" placeholder="YouTube URL or title — e.g. never gonna give you up" />
      <button class="btn" id="btn" onclick="run()">Search</button>
    </div>
    <pre class="box empty" id="out">Response will appear here...</pre>
  </div>

  <!-- About -->
  <div class="card about">
    <div class="card-title"><span>ℹ️</span> About</div>
    <p>
      Pass any YouTube URL or plain search title to <code>/api/v1/q</code> and get back
      full video metadata — title, author, channel, thumbnail, duration, view count, description —
      plus direct <strong>MP4 (HD)</strong> and <strong>MP3</strong> download URLs, ready to use.
      Results are cached for 90 seconds so repeated requests are instant.
    </p>
  </div>

  <!-- Disclaimer -->
  <div class="card disc">
    <div class="card-title"><span>⚠️</span> Copyright Disclaimer</div>
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
  async function run() {
    const q   = document.getElementById('q').value.trim();
    const btn = document.getElementById('btn');
    const out = document.getElementById('out');
    if (!q) return;
    btn.disabled = true;
    btn.textContent = 'Loading…';
    out.className = 'box';
    out.textContent = 'Fetching…';
    try {
      const res  = await fetch('/api/v1/q?=' + encodeURIComponent(q));
      const data = await res.json();
      out.textContent = JSON.stringify(data, null, 2);
      out.className = res.ok ? 'box' : 'box err';
    } catch (e) {
      out.textContent = 'Network error: ' + e.message;
      out.className = 'box err';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Search';
    }
  }
  document.getElementById('q').addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
</script>

</body>
</html>`;
}

router.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(buildHtml(VERSION));
});

export default router;

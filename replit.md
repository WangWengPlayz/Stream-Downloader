# YouTube Downloader API

REST API that accepts a YouTube URL **or a plain title/keyword** and returns direct MP4 and MP3 download links.

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **Framework**: Express 5
- **Search**: `yt-search` — resolves title queries to a YouTube video ID and fetches real-time metadata
- **Downloads**: `nayan-media-downloaders` — returns direct MP4 (HD) and MP3 download URLs
- **Logging**: pino + pino-http (pretty in dev, JSON in production)
- **Build**: esbuild (CJS/ESM bundle via `build.mjs`)
- **TypeScript**: 5.9, strict

## API

### `GET /api/v1/q?=(url or title)`

Full metadata endpoint. Returns video info, thumbnail, and download links.

**Examples:**
```
/api/v1/q?=lay me down sam smith
/api/v1/q?=https://youtu.be/dQw4w9WgXcQ
/api/v1/q?=https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**Response:**
```json
{
  "version": "2.0.0",
  "success": true,
  "creditTo": "MJL",
  "cached": false,
  "ms": 1200,
  "video_id": "dQw4w9WgXcQ",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "info": {
    "title": "...",
    "author": "...",
    "channel_url": "...",
    "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "duration": "3:33",
    "duration_seconds": 213,
    "views": 1768872612,
    "published": "16 years ago",
    "description": "..."
  },
  "media": {
    "mp4": { "url": "https://...", "quality": "HD" },
    "mp3": { "url": "https://..." }
  }
}
```

### `GET /api/v2/q?=(url or title)`

Fast endpoint. Skips full metadata lookup — only returns download links.
No `title`, `video_id`, or `url` fields. Optimized for speed.

**Response:**
```json
{
  "credit": "MJL",
  "version": "2.0.0",
  "ms": 900,
  "media": {
    "mp4": "https://...",
    "mp3": "https://..."
  }
}
```

### `GET /api/healthz`

Returns `{ "status": "ok" }`.

## Thumbnail Fix (v1)

Thumbnail resolution uses a multi-source fallback chain:
1. `yt-search` thumbnail field
2. `yt-search` image field
3. `nayan-media-downloaders` thumbnail field
4. Constructed fallback: `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg`

This guarantees a thumbnail URL is always present in the response.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build/emit composite lib declarations
- `pnpm --filter @workspace/api-server run dev` — run API server in dev mode
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle

## Deployment

### Replit (dev)
Port: `8080` (Replit-supported port)
```
PORT=8080 pnpm --filter @workspace/api-server run dev
```

### Render
- **Build:** `pnpm install && pnpm --filter @workspace/api-server run build`
- **Start:** `node --enable-source-maps artifacts/api-server/dist/index.mjs`
- Port: `10000` (set automatically by Render via `PORT` env var)
- Health check: `GET /api/healthz`

### Vercel
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Vercel reads `vercel.json` automatically
3. Install command: `pnpm install`
4. Build command: `pnpm run typecheck:libs`
5. Serverless entry: `artifacts/api-server/api/index.ts`

### Self-hosted / Docker
```bash
pnpm install
pnpm --filter @workspace/api-server run build
NODE_ENV=production PORT=8080 node --enable-source-maps artifacts/api-server/dist/index.mjs
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | — | Set to `production` for JSON logs |
| `PORT` | Yes | — | Port to listen on |
| `LOG_LEVEL` | No | `info` | Pino log level |

No database or external API keys required.

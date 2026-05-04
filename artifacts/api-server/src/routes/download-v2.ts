import { Router, type IRouter, type Request, type Response } from "express";
import { createRequire } from "module";
import yts from "yt-search";
import { TtlCache } from "../lib/cache";
import { VERSION } from "../lib/version";

const _require = createRequire(import.meta.url);
const { ytdown } = _require("nayan-media-downloaders") as typeof import("nayan-media-downloaders");

const router: IRouter = Router();

interface V2Response {
  version: string;
  success: true;
  creditTo: "MJL";
  cached: boolean;
  ms: number;
  video_id: string;
  url: string;
  title: string | null;
  media: {
    mp4: { url: string; quality: "HD" } | null;
    mp3: { url: string } | null;
  };
}

const cache = new TtlCache<Omit<V2Response, "ms" | "cached">>(90_000);

const YT_URL_RE =
  /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

function extractVideoId(input: string): string | null {
  const m = input.match(YT_URL_RE);
  return m ? m[1] : null;
}

function isUrl(input: string): boolean {
  return /^https?:\/\//i.test(input);
}

router.get("/v2/q", async (req: Request, res: Response) => {
  const t0 = Date.now();
  const query = req.query[""] as string | undefined;

  if (!query || !query.trim()) {
    res.status(400).json({
      version: VERSION,
      success: false,
      creditTo: "MJL",
      ms: Date.now() - t0,
      error: "Missing query.",
      usage: "/api/v2/q?=(YouTube URL or title)",
      note: "v2 is the fast endpoint — returns only title + download links.",
    });
    return;
  }

  const input = query.trim();

  try {
    let videoId: string | null = null;
    let youtubeUrl: string;
    let titleFromSearch: string | null = null;

    if (isUrl(input)) {
      videoId = extractVideoId(input);
      if (!videoId) {
        res.status(400).json({
          version: VERSION,
          success: false,
          creditTo: "MJL",
          ms: Date.now() - t0,
          error: "Could not extract a YouTube video ID from this URL.",
          input,
        });
        return;
      }
      youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    } else {
      // Single yts() call for title + videoId — no second lookup
      const searchResult = await yts(input);
      const first = searchResult.videos[0];
      if (!first) {
        res.status(404).json({
          version: VERSION,
          success: false,
          creditTo: "MJL",
          ms: Date.now() - t0,
          error: "No YouTube results found for this query.",
          query: input,
        });
        return;
      }
      videoId = first.videoId;
      youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      titleFromSearch = first.title ?? null;
    }

    // Cache hit
    const hit = cache.get(videoId);
    if (hit) {
      res.setHeader("Cache-Control", "public, max-age=90");
      res.json({ ...hit, cached: true, ms: Date.now() - t0 });
      return;
    }

    // Only ytdown — no full yts({ videoId }) metadata call
    const dl = await ytdown(youtubeUrl);
    const dlData = (dl?.status ? dl.data : null) ?? null;

    const mp4Url = dlData?.video ?? dlData?.high ?? null;
    const mp3Url = dlData?.audio ?? dlData?.low ?? null;
    const title = titleFromSearch ?? dlData?.title ?? null;

    const payload: Omit<V2Response, "ms" | "cached"> = {
      version: VERSION,
      success: true,
      creditTo: "MJL",
      video_id: videoId,
      url: youtubeUrl,
      title,
      media: {
        mp4: mp4Url ? { url: mp4Url, quality: "HD" } : null,
        mp3: mp3Url ? { url: mp3Url } : null,
      },
    };

    cache.set(videoId, payload);
    res.setHeader("Cache-Control", "public, max-age=90");
    res.json({ ...payload, cached: false, ms: Date.now() - t0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    req.log.error({ err, input }, "v2 YouTube download error");
    res.status(500).json({
      version: VERSION,
      success: false,
      creditTo: "MJL",
      ms: Date.now() - t0,
      error: message,
      input,
    });
  }
});

export default router;

import { Router, type IRouter, type Request, type Response } from "express";
import { createRequire } from "module";

const _require = createRequire(import.meta.url);
const {
  alldownV2,
  tikdown,
  ytdown,
  twitterdown,
  instagram,
} = _require("nayan-media-downloaders") as typeof import("nayan-media-downloaders");

const router: IRouter = Router();

function detectPlatform(
  url: string,
): "youtube" | "tiktok" | "twitter" | "instagram" | "universal" {
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/twitter\.com|x\.com/i.test(url)) return "twitter";
  if (/instagram\.com/i.test(url)) return "instagram";
  return "universal";
}

router.get("/v1/q", async (req: Request, res: Response) => {
  const query = req.query[""] as string | undefined;

  if (!query || !query.trim()) {
    res.status(400).json({
      success: false,
      error: "Missing query. Usage: /api/v1/q?=(url)",
      supported_platforms: [
        "YouTube (youtube.com / youtu.be)",
        "TikTok (tiktok.com)",
        "Twitter / X (twitter.com / x.com)",
        "Instagram (instagram.com)",
        "Facebook",
        "Pinterest",
        "CapCut",
        "Likee",
        "Threads",
        "Google Drive",
      ],
    });
    return;
  }

  const url = query.trim();
  const platform = detectPlatform(url);

  try {
    // TikTok — rich metadata: views, plays, shares, comments, mp4 + mp3
    if (platform === "tiktok") {
      const result = await tikdown(url);

      if (!result.status || !result.data) {
        res.status(502).json({ success: false, error: "TikTok fetch failed", url });
        return;
      }

      const d = result.data;
      res.json({
        success: true,
        platform: "tiktok",
        info: {
          title: d.title ?? null,
          author: d.author?.nickname ?? null,
          username: d.author?.unique_id ?? null,
          avatar: d.author?.avatar ?? null,
          duration: d.duration ?? null,
          views: d.view ?? null,
          plays: d.play ?? null,
          comments: d.comment ?? null,
          shares: d.share ?? null,
          downloads: d.download ?? null,
        },
        media: {
          mp4: d.video ? { url: d.video } : null,
          mp3: d.audio ? { url: d.audio } : null,
        },
      });
      return;
    }

    // YouTube — video info + mp4/mp3 download links
    if (platform === "youtube") {
      const result = await ytdown(url);

      if (!result.status || !result.data) {
        res.status(502).json({ success: false, error: "YouTube fetch failed", url });
        return;
      }

      const d = result.data;
      res.json({
        success: true,
        platform: "youtube",
        info: {
          title: d.title ?? null,
          thumbnail: d.thumbnail ?? null,
          duration: d.duration ?? null,
        },
        media: {
          mp4: (d.video ?? d.high) ? { url: d.video ?? d.high, quality: "HD" } : null,
          mp3: (d.audio ?? d.low) ? { url: d.audio ?? d.low } : null,
        },
      });
      return;
    }

    // Twitter / X — HD and SD mp4 links
    if (platform === "twitter") {
      const result = await twitterdown(url);

      if (!result.status || !result.data) {
        res.status(502).json({ success: false, error: "Twitter fetch failed", url });
        return;
      }

      const d = result.data;
      res.json({
        success: true,
        platform: "twitter",
        info: {},
        media: {
          mp4: d.HD ? { url: d.HD, quality: "HD" } : (d.SD ? { url: d.SD, quality: "SD" } : null),
          mp3: null,
          all: { hd: d.HD ?? null, sd: d.SD ?? null },
        },
      });
      return;
    }

    // Instagram — array of media items
    if (platform === "instagram") {
      const result = await instagram(url);

      if (!result.status) {
        res.status(502).json({ success: false, error: "Instagram fetch failed", url });
        return;
      }

      const items = result.data ?? [];
      res.json({
        success: true,
        platform: "instagram",
        info: { count: items.length },
        media: {
          items: items.map((i) => ({ url: i.url ?? null, thumbnail: i.thumbnail ?? null })),
          mp4: items.find((i) => i.url?.includes("mp4"))?.url ?? items[0]?.url ?? null,
          mp3: null,
        },
      });
      return;
    }

    // Universal — FB, Pinterest, CapCut, Likee, Threads, Google Drive, etc.
    const result = await alldownV2(url);

    if (!result.status || !result.data) {
      res.status(502).json({ success: false, error: "Could not fetch media from this URL", url });
      return;
    }

    const d = result.data;
    res.json({
      success: true,
      platform: "universal",
      info: {
        title: d.title ?? null,
        thumbnail: d.thumbnail ?? null,
        token_expires: d.token_info?.expires_at ?? null,
        token_remaining: d.token_info?.remaining ?? null,
      },
      media: {
        mp4: d.download?.video
          ? { url: d.download.video, stream: d.stream?.video ?? null }
          : null,
        mp3: d.download?.audio
          ? { url: d.download.audio, stream: d.stream?.audio ?? null }
          : null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    req.log.error({ err, url, platform }, "Download error");
    res.status(500).json({ success: false, error: message, platform, url });
  }
});

export default router;

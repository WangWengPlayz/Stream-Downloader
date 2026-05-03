import { Router, type IRouter, type Request, type Response } from "express";
import { ttdl, ytmp3, ytmp4, ytsearch, igdl, fbdl } from "ruhend-scraper";

const router: IRouter = Router();

function detectPlatform(
  input: string,
): "youtube" | "tiktok" | "instagram" | "facebook" | "search" {
  if (/youtube\.com|youtu\.be/i.test(input)) return "youtube";
  if (/tiktok\.com/i.test(input)) return "tiktok";
  if (/instagram\.com/i.test(input)) return "instagram";
  if (/facebook\.com|fb\.watch/i.test(input)) return "facebook";
  return "search";
}

router.get("/v1/q", async (req: Request, res: Response) => {
  const query = req.query[""] as string | undefined;

  if (!query || !query.trim()) {
    res.status(400).json({
      success: false,
      error: "Missing query. Use: /api/v1/q?=(url or title)",
    });
    return;
  }

  const input = query.trim();
  const platform = detectPlatform(input);

  try {
    if (platform === "youtube") {
      const [mp4Data, mp3Data] = await Promise.all([
        ytmp4(input).catch(() => null),
        ytmp3(input).catch(() => null),
      ]);

      const base = mp4Data ?? mp3Data;

      res.json({
        success: true,
        platform: "youtube",
        info: {
          title: base?.title ?? null,
          author: base?.author ?? null,
          description: base?.description ?? null,
          duration: base?.duration ?? null,
          views: base?.views ?? null,
          uploaded: base?.upload ?? null,
          thumbnail: base?.thumbnail ?? null,
        },
        media: {
          mp4: mp4Data
            ? { url: mp4Data.video ?? mp4Data.audio ?? null, quality: "360p" }
            : null,
          mp3: mp3Data ? { url: mp3Data.audio ?? null } : null,
        },
      });
      return;
    }

    if (platform === "tiktok") {
      const data = await ttdl(input);

      res.json({
        success: true,
        platform: "tiktok",
        info: {
          title: data.title ?? null,
          author: data.author ?? null,
          username: data.username ?? null,
          published: data.published ?? null,
          likes: data.like ?? null,
          comments: data.comment ?? null,
          shares: data.share ?? null,
          views: data.views ?? null,
          bookmarks: data.bookmark ?? null,
          thumbnail: data.cover ?? null,
          profilePicture: data.profilePicture ?? null,
        },
        media: {
          mp4: data.video
            ? {
                url: Array.isArray(data.video) ? data.video[0] : data.video,
                all: Array.isArray(data.video) ? data.video : [data.video],
              }
            : null,
          mp3: data.music
            ? {
                url: Array.isArray(data.music) ? data.music[0] : data.music,
              }
            : null,
        },
      });
      return;
    }

    if (platform === "instagram") {
      const data = await igdl(input);
      const items = data?.data ?? [];

      res.json({
        success: true,
        platform: "instagram",
        info: { count: items.length },
        media: {
          items,
          mp4:
            items.find((i) => i.url?.includes("mp4"))?.url ??
            items[0]?.url ??
            null,
          mp3: null,
        },
      });
      return;
    }

    if (platform === "facebook") {
      const data = await fbdl(input);
      const items = data?.data ?? [];

      res.json({
        success: true,
        platform: "facebook",
        info: {},
        media: {
          items,
          mp4:
            items.find((i) => i.resolution?.toLowerCase().includes("hd"))
              ?.url ??
            items[0]?.url ??
            null,
          mp3: null,
        },
      });
      return;
    }

    // Search mode — treat input as a YouTube keyword search
    const { video, channel } = await ytsearch(input);

    res.json({
      success: true,
      platform: "youtube_search",
      query: input,
      results: {
        videos: (video ?? []).slice(0, 10).map((v) => ({
          title: v.title ?? null,
          url: v.url ?? null,
          duration: v.durationH ?? null,
          published: v.publishedTime ?? null,
          views: v.view ?? null,
          thumbnail: v.thumbnail?.[0]?.url ?? null,
          author: { name: v.author?.name ?? null, url: v.author?.url ?? null },
        })),
        channels: (channel ?? []).slice(0, 5).map((c) => ({
          name: c.channelName ?? null,
          url: c.url ?? null,
          subscribers: c.subscriberH ?? null,
          videoCount: c.videoCount ?? null,
        })),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    req.log.error({ err, input, platform }, "Download error");
    res.status(500).json({ success: false, error: message, platform, input });
  }
});

export default router;

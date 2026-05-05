import { Router, type IRouter } from "express";
import { VERSION } from "../lib/version";
import { increment, recordSuccess, recordError } from "../lib/counter";

const router: IRouter = Router();

const startedAt = new Date().toISOString();

router.get("/uptime", (_req, res) => {
  const ApiCount = increment();
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 400) recordSuccess();
    else recordError();
  });
  res.json({
    version: VERSION,
    creditTo: "MJL",
    ApiCount,
    status: "online",
    uptime_seconds: Math.floor(process.uptime()),
    started_at: startedAt,
    timestamp: new Date().toISOString(),
  });
});

export default router;

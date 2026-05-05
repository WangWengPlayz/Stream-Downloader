import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { VERSION } from "../lib/version";
import { increment, recordSuccess, recordError } from "../lib/counter";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const ApiCount = increment();
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 400) recordSuccess();
    else recordError();
  });
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({ ...data, version: VERSION, creditTo: "MJL", ApiCount });
});

export default router;

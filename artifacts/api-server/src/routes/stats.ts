import { Router, type IRouter } from "express";
import { VERSION } from "../lib/version";
import { getCount, getSuccess, getError } from "../lib/counter";

const router: IRouter = Router();

router.get("/stats", (_req, res) => {
  res.json({
    version: VERSION,
    creditTo: "MJL",
    ApiCount: getCount(),
    successCount: getSuccess(),
    errorCount: getError(),
    timestamp: new Date().toISOString(),
  });
});

export default router;

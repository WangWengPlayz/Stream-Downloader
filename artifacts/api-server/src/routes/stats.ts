import { Router, type IRouter } from "express";
import { VERSION } from "../lib/version";
import { getCount, getSuccess, getError, getMongoStatus } from "../lib/counter";

const router: IRouter = Router();

router.get("/stats", async (_req, res) => {
  const mongoStatus = getMongoStatus();
  res.json({
    version: VERSION,
    creditTo: "MJL",
    ApiCount: await getCount(),
    successCount: getSuccess(),
    errorCount: getError(),
    mongoConnected: mongoStatus === "connected",
    mongoStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;

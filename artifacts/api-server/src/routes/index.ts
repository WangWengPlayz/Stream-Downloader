import { Router, type IRouter } from "express";
import healthRouter from "./health";
import uptimeRouter from "./uptime";
import downloadRouter from "./download";
import downloadV2Router from "./download-v2";
import homeRouter from "./home";

const router: IRouter = Router();

router.use(healthRouter);
router.use(uptimeRouter);
router.use(downloadRouter);
router.use(downloadV2Router);
// Home page also accessible at /api/ for Replit proxy
router.use("/", homeRouter);

export default router;

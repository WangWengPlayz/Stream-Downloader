import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import router from "./routes";
import homeRouter from "./routes/home";
import { logger } from "./lib/logger";

const app: Express = express();

// Gzip all responses — big win for JSON payloads and HTML
app.use(compression());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pretty-print all JSON responses automatically (2-space indent)
app.set("json spaces", 2);

// Home page — accessible at root (Render / Vercel) and at /api/ (Replit proxy)
app.use("/", homeRouter);
app.use("/api", router);

export default app;

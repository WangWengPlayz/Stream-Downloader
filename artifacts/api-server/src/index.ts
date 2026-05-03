import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

// Auto-restart every 24 hours to keep memory clean
if (process.env.NODE_ENV === "production") {
  const MS_24H = 24 * 60 * 60 * 1000;
  setTimeout(() => {
    logger.info("24-hour scheduled restart — exiting cleanly");
    process.exit(0);
  }, MS_24H).unref();
}
